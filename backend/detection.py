from ultralytics import YOLO
import cv2
import numpy as np

class FireDetector:
    def __init__(self, model_path='best.pt'):
        # Load the custom fire detection model
        self.model = YOLO(model_path)
        print(f"Model loaded. Classes: {self.model.names}")
        
    def process_frame(self, frame):
        """
        Process a single frame to detect objects (fire/smoke).
        Returns the annotated frame and detection results.
        """
        results = self.model(frame, conf=0.25)
        annotated_frame = results[0].plot()
        
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                cls = int(box.cls[0])
                conf = float(box.conf[0])
                name = self.model.names[cls]
                print(f"DEBUG DETECT: {name} ({conf:.2f})") # Debug log
                detections.append({
                    "class": name,
                    "confidence": conf,
                    "bbox": box.xyxy[0].tolist()
                })
                
        return annotated_frame, detections
