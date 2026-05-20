from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
from detection import FireDetector
from camera_manager import CameraManager
import database
import os
import cv2
import asyncio
import time

app = FastAPI(title="AI Fire Detection System")

# Initialize database
database.init_db()

# Initialize components
detector = FireDetector()
camera_manager = CameraManager(detector)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount snapshots directory
if not os.path.exists("snapshots"):
    os.makedirs("snapshots")
app.mount("/snapshots", StaticFiles(directory="snapshots"), name="snapshots")

# Connection Manager for WebSockets
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                # Connection is likely closed, ignore and let cleanup handle it
                pass

manager = ConnectionManager()
main_loop = None

def broadcast_alert(alert_data):
    """Safely broadcast alert data from background thread to WebSocket connections."""
    if main_loop:
        asyncio.run_coroutine_threadsafe(manager.broadcast(alert_data), main_loop)
    else:
        print("[WebSocket] Event loop not ready. Broadcast skipped.")

@app.on_event("startup")
async def startup_event():
    global main_loop
    main_loop = asyncio.get_running_loop()
    # Register the alert callback to bridge camera manager and websocket
    camera_manager.alert_callback = broadcast_alert
    print("FastAPI startup: WebSocket broadcast callback registered.")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Fire Detection System API is running"}

def generate_camera_stream(camera_id):
    """Generator for camera stream with CPU protection sleep."""
    while True:
        frame = camera_manager.get_frame(camera_id)
        if frame is not None:
            # Encode frame to JPEG
            ret, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            time.sleep(0.03) # Cap streaming FPS to ~30 FPS to save CPU/Bandwidth
        else:
            # Yield a placeholder or empty bytes, sleep to prevent CPU spinning
            time.sleep(0.2)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + b'' + b'\r\n')

@app.get("/video_feed")
def video_feed_default():
    """Default video feed (Kamera 1 - if exists) for backward compatibility."""
    first_active_cam = next(iter(camera_manager.cameras.keys()), 1)
    return StreamingResponse(generate_camera_stream(first_active_cam), 
                             media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/video_feed/{camera_id}")
def video_feed(camera_id: int):
    """Video feed for specific camera."""
    return StreamingResponse(generate_camera_stream(camera_id), 
                             media_type="multipart/x-mixed-replace; boundary=frame")

class CameraModel(BaseModel):
    source: str
    name: str

@app.get("/cameras")
def get_cameras():
    """Get list of cameras with real-time status details."""
    cameras = []
    for id, cam in camera_manager.cameras.items():
        cameras.append({
            "id": id, 
            "name": cam.name, 
            "source": str(cam.source),
            "is_active": cam.is_active,
            "status": cam.status
        })
    return {"cameras": cameras}

@app.post("/cameras")
def add_new_camera(cam: CameraModel):
    """Add a new camera."""
    new_id = camera_manager.add_camera(cam.source, cam.name)
    return {"status": "ok", "id": new_id, "message": "Camera added"}

@app.delete("/cameras/{camera_id}")
def delete_camera(camera_id: int):
    """Remove a camera."""
    if camera_manager.remove_camera(camera_id):
        return {"status": "ok", "message": "Camera removed"}
    raise HTTPException(status_code=404, detail="Camera not found")

@app.post("/cameras/{camera_id}/toggle")
def toggle_camera(camera_id: int, active: bool):
    """Enable or disable a camera."""
    if camera_manager.toggle_camera(camera_id, active):
        return {"status": "ok", "message": f"Camera {'enabled' if active else 'disabled'}"}
    raise HTTPException(status_code=404, detail="Camera not found")

@app.get("/alerts")
def get_alerts():
    # Fetch recent events from database
    events = database.get_recent_events(limit=50)
    
    # Format for frontend
    formatted_alerts = []
    for event in events:
        formatted_alerts.append({
            "id": event["id"],
            "timestamp": event["timestamp"],
            "type": event["type"],
            "confidence": event["confidence"],
            "snapshot": event["snapshot_path"]
        })
        
    return {"alerts": formatted_alerts}

@app.get("/stats")
def get_stats():
    """Get daily event statistics."""
    stats = database.get_daily_stats()
    return {"stats": stats}

@app.get("/history")
def get_history(limit: int = 50, offset: int = 0):
    """Get historical events with pagination."""
    events = database.get_all_events(limit, offset)
    return {"events": events}

class SettingsModel(BaseModel):
    key: str
    value: str

@app.get("/settings")
def get_settings():
    """Get all settings (masking secrets)."""
    settings = database.get_all_settings()
    # Mask secrets for frontend display
    masked_keys = ["smtp_password", "telegram_bot_token"]
    for key in masked_keys:
        if key in settings and settings[key]:
            settings[key] = "********"
    return {"settings": settings}

@app.post("/settings")
def save_setting(setting: SettingsModel):
    """Save a setting."""
    # Don't save masked values back
    if setting.value == "********":
        return {"status": "skipped", "message": "Masked value ignored"}
    
    database.set_setting(setting.key, setting.value)
    return {"status": "ok", "message": "Setting saved"}

import notification

@app.post("/test-notification")
def test_notification():
    """Trigger a test notification."""
    # Use a placeholder image or None
    notification.trigger_notifications("TEST EVENT", 0.99, None)
    return {"status": "ok", "message": "Test notification triggered"}

# WebSocket Endpoint
@app.websocket("/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket connection endpoint for real-time alert push."""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection open and listen for heartbeat or messages
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
