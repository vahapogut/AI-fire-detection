# 🔥 FIRE GUARD AI - Yapay Zeka Destekli Yangın Tespit Sistemi

**Fire Guard AI**, geleneksel yangın sensörlerinin yetersiz kaldığı durumlar için geliştirilmiş, gerçek zamanlı görüntü işleme ve yapay zeka kullanan ileri seviye bir yangın ve duman tespit sistemidir.

Bu proje, güvenlik kameralarından (IP, RTSP, USB) alınan görüntüleri saniyeler içinde analiz eder, yangın veya duman tespit ettiğinde anında uyarı verir ve belirlenen kanallar (Telegram, E-posta) üzerinden bildirim gönderir.

## 🚀 Özellikler

*   **🛡️ Gerçek Zamanlı Tespit:** YOLOv8 modeli ile milisaniyeler içinde yangın ve duman tespiti.
*   **📸 Çoklu Kamera Desteği:** Sınırsız sayıda kamera (Webcam, RTSP, IP Kamera) ekleme ve aynı anda izleme (Grid Görünümü).
*   **🧠 Arka Plan Koruması:** Web arayüzü kapalı olsa bile arka planda çalışan servis sayesinde 7/24 kesintisiz izleme.
*   **🔔 Anlık Bildirimler:**
    *   **Telegram:** Olay anının fotoğrafıyla birlikte doğrudan telefonunuza bildirim.
    *   **E-posta:** Detaylı durum raporu ve fotoğraf içeren e-posta gönderimi.
*   **📊 İstatistik ve Geçmiş:**
    *   Günlük/Haftalık olay grafikleri.
    *   Geçmiş olayların arşivlenmesi ve fotoğraf kanıtlarının saklanması.
*   **⚙️ Kolay Yönetim:** Kullanıcı dostu arayüz üzerinden kamera ekleme/çıkarma ve bildirim ayarlarını yapılandırma.

## 🛠️ Teknolojiler

*   **Backend:** Python, FastAPI, OpenCV, Ultralytics (YOLOv8), SQLite
*   **Frontend:** Next.js, React, Tailwind CSS, Recharts
*   **Yapay Zeka:** YOLOv8 (Yangın ve Duman eğitimi yapılmış özel model)

## 📦 Kurulum

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin.

### Ön Gereksinimler
*   Python 3.9 veya üzeri
*   Node.js 18 veya üzeri
*   Git

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/kullaniciadi/fire-guard-ai.git
cd fire-guard-ai
```

### 2. Backend Kurulumu
Backend servisi görüntü işleme ve veritabanı işlemlerini yürütür.

```bash
cd backend
# Sanal ortam oluşturun (Önerilen)
python -m venv venv
# Windows için aktivasyon:
venv\Scripts\activate
# Mac/Linux için aktivasyon:
# source venv/bin/activate

# Gerekli paketleri yükleyin
pip install -r requirements.txt

# Uygulamayı başlatın
python main.py
```
*Backend varsayılan olarak `http://localhost:8000` adresinde çalışır.*

### 3. Frontend Kurulumu
Kullanıcı arayüzü için:

```bash
cd frontend
# Paketleri yükleyin
npm install

# Uygulamayı başlatın
npm run dev
```
*Frontend varsayılan olarak `http://localhost:3000` adresinde çalışır.*

## 🖥️ Kullanım

1.  Tarayıcınızda `http://localhost:3000` adresine gidin.
2.  **Kamera Ekle** butonuna tıklayarak kaynak ekleyin:
    *   Webcam için: `0` veya `1`
    *   IP Kamera için: `rtsp://kullanici:sifre@ip_adresi:554/stream`
3.  **Ayarlar** menüsünden Telegram ve E-posta bilgilerinizi girin ve sistemi test edin.
4.  Sistem artık aktif! Bir ateş veya duman gördüğünde sizi uyaracaktır.

## 🤝 Katkıda Bulunma

1.  Bu depoyu Fork'layın.
2.  Yeni bir özellik dalı (branch) oluşturun (`git checkout -b ozellik/YeniOzellik`).
3.  Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik eklendi'`).
4.  Dalınızı Push edin (`git push origin ozellik/YeniOzellik`).
5.  Bir Pull Request oluşturun.

## 📄 Lisans

Bu proje MIT Lisansı ile lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakınız.

---
*Geliştirici: Vahap - Fire Guard AI Project*
