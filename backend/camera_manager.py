import cv2
import threading
import time
import os
from database import add_event
import notification

# Ensure snapshots directory exists
SNAPSHOT_DIR = "snapshots"
if not os.path.exists(SNAPSHOT_DIR):
    os.makedirs(SNAPSHOT_DIR)

class Camera:
    def __init__(self, id, source, name="Kamera"):
        self.id = id
        self.source = source
        self.name = name
        self.cap = cv2.VideoCapture(source)
        self.lock = threading.Lock()
        self.running = True
        self.last_frame = None
        self.last_annotated_frame = None
        self.detection_persistence = {}
        self.event_cooldowns = {}
        self.COOLDOWN_SECONDS = 5
        self.frame_count = 0

    def read(self):
        with self.lock:
            if self.cap.isOpened():
                success, frame = self.cap.read()
                if success:
                    self.last_frame = frame
                    return True, frame
        return False, None

    def release(self):
        self.running = False
        if self.cap.isOpened():
            self.cap.release()

class CameraManager:
    def __init__(self, detector):
        self.cameras = {}
        self.detector = detector
        self.next_id = 0
        self.running = True
        
        # Start background detection thread
        self.thread = threading.Thread(target=self._detection_loop, daemon=True)
        self.thread.start()

    def add_camera(self, source, name="Kamera"):
        """Add a new camera source."""
        # Check if source is integer (webcam index)
        try:
            src = int(source)
        except ValueError:
            src = source
            
        cam = Camera(self.next_id, src, name)
        self.cameras[self.next_id] = cam
        self.next_id += 1
        return cam.id

    def remove_camera(self, camera_id):
        """Remove a camera."""
        if camera_id in self.cameras:
            self.cameras[camera_id].release()
            del self.cameras[camera_id]
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
            # Iterate over a copy of keys to avoid runtime error if camera is removed
            for cam_id in list(self.cameras.keys()):
                cam = self.cameras.get(cam_id)
                if not cam or not cam.running:
                    continue

                success, frame = cam.read()
                if not success:
                    continue

                cam.frame_count += 1
                
                # Process detection every 3rd frame
                if cam.frame_count % 3 == 0:
                    annotated_frame, detections = self.detector.process_frame(frame)
                    cam.last_annotated_frame = annotated_frame
                    
                    if detections:
                        self._process_detections(cam, detections, annotated_frame)
                    else:
                        # Reset persistence if no detections
                        cam.detection_persistence = {}
                else:
                    # For skipped frames, keep the last annotated one
                    pass
            
            # Small sleep to prevent CPU hogging
            time.sleep(0.01)

    def _process_detections(self, cam, detections, annotated_frame):
        current_classes = set()
        
        for det in detections:
            cls_name = det["class"]
            conf = det["confidence"]
            
            if conf < 0.25:
                continue
                
            current_classes.add(cls_name)
            
            # Increment persistence
            cam.detection_persistence[cls_name] = cam.detection_persistence.get(cls_name, 0) + 1
            
            # Trigger Alert
            if cam.detection_persistence[cls_name] >= 2 or conf > 0.6:
                current_time = time.time()
                last_time = cam.event_cooldowns.get(cls_name, 0)
                
                if current_time - last_time > cam.COOLDOWN_SECONDS:
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
        add_event(cls_name, conf, snapshot_url)
        
        print(f"[Cam {cam.id}] Detected {cls_name} ({conf:.2f})")
        
        # Notifications
        threading.Thread(target=notification.trigger_notifications, 
                       args=(cls_name, conf, filepath)).start()
