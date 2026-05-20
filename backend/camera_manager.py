import cv2
import threading
import time
import os
import notification

# Ensure snapshots directory exists
SNAPSHOT_DIR = "snapshots"
if not os.path.exists(SNAPSHOT_DIR):
    os.makedirs(SNAPSHOT_DIR)

class Camera:
    def __init__(self, id, source, name="Kamera", is_active=True):
        self.id = id
        self.source = source
        self.name = name
        self.is_active = is_active
        self.lock = threading.Lock()
        self.running = True
        self.last_frame = None
        self.last_annotated_frame = None
        self.detection_persistence = {}
        self.event_cooldowns = {}
        self.frame_count = 0
        
        self.status = "connecting"  # connecting, connected, disconnected
        self.consecutive_failures = 0
        self.cap = None
        self.last_reconnect_attempt = 0
        
        # Start connection in a separate thread to avoid blocking startup
        threading.Thread(target=self._connect, daemon=True).start()

    def _connect(self):
        with self.lock:
            self.status = "connecting"
            if self.cap is not None:
                self.cap.release()
            
            # Check if source is integer (webcam index)
            try:
                src = int(self.source)
            except ValueError:
                src = self.source
                
            self.cap = cv2.VideoCapture(src)
            if self.cap.isOpened():
                self.status = "connected"
                self.consecutive_failures = 0
                print(f"[Camera {self.id}] Successfully connected to: {self.source}")
            else:
                self.status = "disconnected"
                print(f"[Camera {self.id}] Failed to connect to: {self.source}")

    def trigger_reconnect(self):
        """Attempts to reconnect if currently disconnected and cooldown has passed."""
        current_time = time.time()
        if (self.status == "disconnected" and 
            self.is_active and 
            self.running and 
            current_time - self.last_reconnect_attempt > 10):
            
            self.last_reconnect_attempt = current_time
            print(f"[Camera {self.id}] Asynchronously reconnecting...")
            threading.Thread(target=self._connect, daemon=True).start()

    def read(self):
        if not self.is_active or not self.running:
            return False, None
            
        with self.lock:
            if self.status != "connected" or self.cap is None or not self.cap.isOpened():
                return False, None
                
            success, frame = self.cap.read()
            if success:
                self.last_frame = frame
                self.consecutive_failures = 0
                return True, frame
            else:
                self.consecutive_failures += 1
                if self.consecutive_failures >= 5:
                    self.status = "disconnected"
                    print(f"[Camera {self.id}] Lost connection (5 consecutive failures)")
                return False, None

    def release(self):
        self.running = False
        with self.lock:
            self.status = "disconnected"
            if self.cap is not None:
                self.cap.release()

class CameraManager:
    def __init__(self, detector):
        self.cameras = {}
        self.detector = detector
        self.running = True
        self.alert_callback = None
        
        # Load persisted cameras from database
        self.load_cameras_from_db()
        
        # Start background detection thread
        self.thread = threading.Thread(target=self._detection_loop, daemon=True)
        self.thread.start()

    def load_cameras_from_db(self):
        """Load all cameras from the database."""
        try:
            import database
            db_cams = database.get_all_db_cameras()
            for db_cam in db_cams:
                cam_id = db_cam["id"]
                name = db_cam["name"]
                source = db_cam["source"]
                is_active = db_cam["is_active"] == 1
                
                if cam_id in self.cameras:
                    self.cameras[cam_id].name = name
                    self.cameras[cam_id].source = source
                    self.cameras[cam_id].is_active = is_active
                else:
                    cam = Camera(cam_id, source, name, is_active)
                    self.cameras[cam_id] = cam
            print(f"Loaded {len(db_cams)} cameras from database.")
        except Exception as e:
            print(f"Error loading cameras from database: {e}")

    def add_camera(self, source, name="Kamera"):
        """Add a new camera source to database and memory."""
        import database
        cam_id = database.add_db_camera(name, source, 1)
        cam = Camera(cam_id, source, name, True)
        self.cameras[cam_id] = cam
        return cam_id

    def remove_camera(self, camera_id):
        """Remove a camera."""
        import database
        if camera_id in self.cameras:
            self.cameras[camera_id].release()
            del self.cameras[camera_id]
            database.delete_db_camera(camera_id)
            return True
        return False

    def toggle_camera(self, camera_id, is_active):
        """Enable or disable a camera."""
        import database
        if camera_id in self.cameras:
            self.cameras[camera_id].is_active = is_active
            database.set_db_camera_status(camera_id, is_active)
            if not is_active:
                self.cameras[camera_id].release()
            else:
                self.cameras[camera_id].running = True
                self.cameras[camera_id].status = "connecting"
                threading.Thread(target=self.cameras[camera_id]._connect, daemon=True).start()
            return True
        return False

    def get_frame(self, camera_id):
        """Get the latest annotated frame for a camera."""
        if camera_id in self.cameras:
            cam = self.cameras[camera_id]
            if cam.last_annotated_frame is not None:
                return cam.last_annotated_frame
            elif cam.last_frame is not None:
                return cam.last_frame
        return None

    def _detection_loop(self):
        """Background loop to process frames from all cameras."""
        while self.running:
            for cam_id in list(self.cameras.keys()):
                cam = self.cameras.get(cam_id)
                if not cam or not cam.running or not cam.is_active:
                    continue

                success, frame = cam.read()
                if not success:
                    cam.trigger_reconnect()
                    continue

                cam.frame_count += 1
                
                # Process detection every 3rd frame
                if cam.frame_count % 3 == 0:
                    annotated_frame, detections = self.detector.process_frame(frame)
                    cam.last_annotated_frame = annotated_frame
                    
                    if detections:
                        self._process_detections(cam, detections, annotated_frame)
                    else:
                        cam.detection_persistence = {}
            
            time.sleep(0.01)

    def _process_detections(self, cam, detections, annotated_frame):
        current_classes = set()
        
        # Get dynamic settings from database
        import database
        try:
            conf_threshold = float(database.get_setting("ai_confidence_threshold", "0.25"))
            persistence_limit = int(database.get_setting("ai_persistence_frames", "2"))
            cooldown_seconds = float(database.get_setting("ai_cooldown_seconds", "5"))
        except Exception:
            conf_threshold = 0.25
            persistence_limit = 2
            cooldown_seconds = 5
        
        for det in detections:
            cls_name = det["class"]
            conf = det["confidence"]
            
            if conf < conf_threshold:
                continue
                
            current_classes.add(cls_name)
            
            # Increment persistence
            cam.detection_persistence[cls_name] = cam.detection_persistence.get(cls_name, 0) + 1
            
            # Trigger Alert
            if cam.detection_persistence[cls_name] >= persistence_limit or conf > 0.6:
                current_time = time.time()
                last_time = cam.event_cooldowns.get(cls_name, 0)
                
                if current_time - last_time > cooldown_seconds:
                    self._save_event(cam, cls_name, conf, annotated_frame)
                    cam.event_cooldowns[cls_name] = current_time

        # Cleanup persistence
        for existing_cls in list(cam.detection_persistence.keys()):
            if existing_cls not in current_classes:
                cam.detection_persistence[existing_cls] = 0

    def _save_event(self, cam, cls_name, conf, frame):
        # Save Snapshot
        timestamp_str = time.strftime("%Y%m%d_%H%M%S")
        filename = f"event_{timestamp_str}_{cam.id}_{cls_name}.jpg"
        filepath = os.path.join(SNAPSHOT_DIR, filename)
        
        cv2.imwrite(filepath, frame)
        
        # Database
        snapshot_url = f"/snapshots/{filename}"
        import database
        event_id, timestamp = database.add_event(cls_name, conf, snapshot_url)
        
        print(f"[Cam {cam.id}] Detected {cls_name} ({conf:.2f})")
        
        # Trigger WebSocket callback if registered
        if self.alert_callback:
            try:
                self.alert_callback({
                    "id": event_id,
                    "timestamp": timestamp,
                    "type": cls_name,
                    "confidence": conf,
                    "snapshot": snapshot_url,
                    "camera_name": cam.name
                })
            except Exception as e:
                print(f"Error in alert callback: {e}")
        
        # Notifications
        threading.Thread(target=notification.trigger_notifications, 
                       args=(cls_name, conf, filepath)).start()
