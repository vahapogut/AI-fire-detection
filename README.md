# Fire Guard AI

Fire Guard AI is an advanced fire and smoke detection system designed to provide 24/7 protection using real-time computer vision and artificial intelligence.

## Features

### Real-Time Detection
* Real-time fire and smoke detection using the YOLOv8 AI model, powered by WebSockets for instant, sub-second alert updates on the dashboard.

### Persistent Multi-Camera Grid
* Monitor unlimited cameras simultaneously. All camera sources are persisted in a SQLite database, meaning they are saved even if the server restarts.
* Support for enabling/disabling cameras temporarily from the dashboard without deleting them.

### Automatic Reconnection
* Intelligent connection monitoring. If an RTSP or webcam source is disconnected, the system safely marks its status and attempts to reconnect asynchronously in the background every 10 seconds without blocking the pipeline.
* Interactive camera status indicators (Connected, Connecting, Disconnected, Inactive) with beautiful dark-mode placeholder states.

### Dynamic AI & Alarm Settings
* Configure AI Confidence Threshold, Alarm Cooldown, and Detection Persistence (number of frames) dynamically from the Settings Panel without restarting the application.
* Toggle siren sound alert directly in the UI, synchronized globally.

### Statistics & History
* Interactive weekly statistics charts.
* Comprehensive history modal enabling users to view and search past fire/smoke detection events along with high-definition snapshots of the event moment.

### Instant Notifications
* Telegram: Receive real-time photos of the detected incident directly to your phone.
* Email: Detailed incident reports sent to your inbox.

## Tech Stack

* Backend: Python, FastAPI, OpenCV, Ultralytics (YOLOv8), SQLite, WebSockets
* Frontend: Next.js, React, Tailwind CSS, Recharts
* AI Model: Custom trained YOLOv8 for Fire & Smoke

## Installation

Follow these steps to run the project locally.

### Prerequisites
* Python 3.9+
* Node.js 18+
* Git

### Easy Setup (Windows Only)
You can start the backend and frontend simultaneously with a single command. Double-click or run:
```bash
start.bat
```
This script will automatically detect your Python installation, create a virtual environment, install requirements, and run both servers.

### Manual Setup

### 1. Clone the Repository
```bash
git clone https://github.com/vahapogut/AI-fire-detection.git
cd AI-fire-detection
```

### 2. Backend Setup
```bash
cd backend
# Create virtual environment
python -m venv venv
# Activate on Windows:
venv\Scripts\activate
# Activate on Mac/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py
```
*Backend runs at http://localhost:8000 by default.*

### 3. Frontend Setup
```bash
cd ../frontend
# Install packages
npm install

# Start the application
npm run dev
```
*Frontend runs at http://localhost:3000 by default.*

## Usage

1. Open http://localhost:3000 in your browser.
2. Click Add Camera to add a camera source:
   - Webcam index: 0 or 1
   - IP Camera / Stream: rtsp://user:password@ip_address:554/stream
3. Go to Settings to configure Telegram, Email, and dynamic AI threshold options.
4. The system is now active. It will warn you instantly when fire or smoke is detected.

## License

Distributed under the MIT License. See LICENSE for more information.

---
Developer: Abdulvahap Öğüt
