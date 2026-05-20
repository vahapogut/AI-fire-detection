# Fire Guard AI / Yapay Zeka Yangın Tespit Sistemi

Fire Guard AI is an advanced fire and smoke detection system designed to provide 24/7 protection using real-time computer vision and artificial intelligence.

Fire Guard AI, gerçek zamanlı görüntü işleme ve yapay zeka kullanarak 7/24 koruma sağlayan ileri seviye bir yangın ve duman tespit sistemidir.

## Features / Özellikler

### Real-Time Detection / Gerçek Zamanlı Tespit
* Real-time fire and smoke detection using the YOLOv8 AI model, powered by WebSockets for instant, sub-second alert updates on the dashboard.
* YOLOv8 yapay zeka modeliyle anlık yangın ve duman tespiti. WebSockets desteği sayesinde kontrol panelinde milisaniyeler içinde anlık uyarı gösterimi.

### Persistent Multi-Camera Grid / Kalıcı Çoklu Kamera Yönetimi
* Monitor unlimited cameras simultaneously. All camera sources are persisted in a SQLite database, meaning they are saved even if the server restarts.
* Kameraları ızgara görünümünde eş zamanlı izleme. Tüm kamera kaynakları SQLite veritabanında kalıcı olarak saklanır, sistem kapansa dahi ayarlar kaybolmaz.
* Support for enabling/disabling cameras temporarily from the dashboard without deleting them.
* Kameraları silmeden geçici olarak arayüz üzerinden aktifleştirme veya devre dışı bırakma (aktif/pasif) desteği.

### Automatic Reconnection / Otomatik Yeniden Bağlanma
* Intelligent connection monitoring. If an RTSP or webcam source is disconnected, the system safely marks its status and attempts to reconnect asynchronously in the background every 10 seconds without blocking the pipeline.
* Akıllı bağlantı izleme. Bir RTSP veya webcam bağlantısı koptuğunda, sistem o kamerayı koptu olarak işaretler ve arka planda ana sistemi engellemeden 10 saniyede bir otomatik yeniden bağlanmayı dener.
* Interactive camera status indicators (Connected, Connecting, Disconnected, Inactive) with beautiful dark-mode placeholder states.
* Arayüz üzerinde gerçek zamanlı kamera durum göstergeleri (Bağlı, Bağlanıyor, Bağlantı Koptu, Pasif) ve bağlantı kopmalarında görüntülenen modern hata ekranları.

### Dynamic AI & Alarm Settings / Dinamik Yapay Zeka ve Alarm Ayarları
* Configure AI Confidence Threshold, Alarm Cooldown, and Detection Persistence (number of frames) dynamically from the Settings Panel without restarting the application.
* Uygulamayı yeniden başlatmaya gerek kalmadan Yapay Zeka Güven Oranı (Confidence), Alarm Tetiklenme Süresi (Cooldown) ve Doğrulama Kare Sayısı (Persistence) değerlerini Ayarlar Panelinden canlı olarak değiştirebilme.
* Toggle siren sound alert directly in the UI, synchronized globally.
* Sistem genelinde senkronize sesli siren alarmı desteği ve arayüz üzerinden açıp kapatabilme özelliği.

### Statics & History / İstatistikler ve Geçmiş Kayıtları
* Interactive weekly statistics charts.
* Haftalık interaktif olay istatistik grafikler.
* Comprehensive history modal enabling users to view and search past fire/smoke detection events along with high-definition snapshots of the event moment.
* Detaylı olay arşivi sayesinde geçmiş yangın/duman olaylarını arayabilme, filtreleyebilme ve olay anı fotoğraflarını (snapshot) görüntüleme.

### Instant Notifications / Anlık Bildirim Gönderimi
* Telegram: Receive real-time photos of the detected incident directly to your phone.
* Telegram: Yangın veya duman algılandığı an olay fotoğraflı anlık bildirimin cep telefonunuza iletilmesi.
* Email: Detailed incident reports sent to your inbox.
* E-posta: Alıcı adresine anlık fotoğraflı detaylı olay raporu gönderilmesi.

## Tech Stack / Teknolojiler

* Backend: Python, FastAPI, OpenCV, Ultralytics (YOLOv8), SQLite, WebSockets
* Frontend: Next.js, React, Tailwind CSS, Recharts
* AI Model: Custom trained YOLOv8 for Fire & Smoke

## Installation / Kurulum

Follow these steps to run the project locally. / Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin.

### Prerequisites / Ön Gereksinimler
* Python 3.9+
* Node.js 18+
* Git

### 1. Clone the Repository / Projeyi Klonlayın
```bash
git clone https://github.com/vahapogut/AI-fire-detection.git
cd AI-fire-detection
```

### 2. Backend Setup / Backend Kurulumu
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

### 3. Frontend Setup / Frontend Kurulumu
```bash
cd ../frontend
# Install packages
npm install

# Start the application
npm run dev
```
*Frontend runs at http://localhost:3000 by default.*

## Usage / Kullanım

1. Open http://localhost:3000 in your browser.
2. Click Add Camera to add a camera source:
   - Webcam index: 0 or 1
   - IP Camera / Stream: rtsp://user:password@ip_address:554/stream
3. Go to Settings to configure Telegram, Email, and dynamic AI threshold options.
4. The system is now active. It will warn you instantly when fire or smoke is detected.

## License / Lisans

Distributed under the MIT License. See LICENSE for more information.

---
Developer: Abdulvahap Öğüt
