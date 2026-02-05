import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import requests
import os
import time
from database import get_setting

# Store last notification time to prevent spamming
# Format: {channel: timestamp}
last_notification = {}
NOTIFICATION_COOLDOWN = 60 # seconds

def send_email(subject, body, snapshot_path=None):
    """Send an email using SMTP settings from database."""
    try:
        smtp_server = get_setting("smtp_server")
        smtp_port = get_setting("smtp_port")
        smtp_user = get_setting("smtp_user")
        smtp_password = get_setting("smtp_password")
        receiver_email = get_setting("receiver_email")
        
        if not all([smtp_server, smtp_port, smtp_user, smtp_password, receiver_email]):
            print("Email notification skipped: Missing SMTP settings.")
            return False

        msg = MIMEMultipart()
        msg["Subject"] = subject
        msg["From"] = smtp_user
        msg["To"] = receiver_email
        
        msg.attach(MIMEText(body, "plain"))
        
        if snapshot_path and os.path.exists(snapshot_path):
            with open(snapshot_path, "rb") as f:
                img_data = f.read()
                image = MIMEImage(img_data, name=os.path.basename(snapshot_path))
                msg.attach(image)
        
        with smtplib.SMTP(smtp_server, int(smtp_port)) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
            
        print(f"Email sent to {receiver_email}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

def send_telegram(message, snapshot_path=None):
    """Send a Telegram message using Bot API settings from database."""
    try:
        bot_token = get_setting("telegram_bot_token")
        chat_id = get_setting("telegram_chat_id")
        
        if not all([bot_token, chat_id]):
            print("Telegram notification skipped: Missing Bot settings.")
            return False

        # Send Photo if available
        if snapshot_path and os.path.exists(snapshot_path):
            url = f"https://api.telegram.org/bot{bot_token}/sendPhoto"
            with open(snapshot_path, "rb") as f:
                files = {"photo": f}
                data = {"chat_id": chat_id, "caption": message}
                response = requests.post(url, data=data, files=files)
        else:
            # Send Text only
            url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
            data = {"chat_id": chat_id, "text": message}
            response = requests.post(url, data=data)
            
        if response.status_code == 200:
            print(f"Telegram message sent to {chat_id}")
            return True
        else:
            print(f"Telegram failed: {response.text}")
            return False

    except Exception as e:
        print(f"Failed to send telegram: {e}")
        return False

def trigger_notifications(event_type, confidence, snapshot_path=None):
    """Trigger all enabled notifications with cooldown check."""
    global last_notification
    current_time = time.time()
    
    # Global cooldown to avoid spamming for same event burst
    if current_time - last_notification.get("global", 0) < NOTIFICATION_COOLDOWN:
        print("Notification skipped due to cooldown.")
        return

    confidence_percent = f"%{confidence * 100:.1f}"
    subject = f"ACİL DURUM: {event_type.upper()} Tespit Edildi!"
    body = f"UYARI!\n\nSistem {confidence_percent} güven oranıyla {event_type} tespit etti.\nZaman: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\nLütfen kontrol ediniz."
    
    # Threading could be added here to not block the main loop, 
    # but for now synchronous call is safer to ensure delivery log visibility.
    
    email_enabled = get_setting("email_enabled") == "true"
    telegram_enabled = get_setting("telegram_enabled") == "true"
    
    if email_enabled:
        send_email(subject, body, snapshot_path)
        
    if telegram_enabled:
        send_telegram(body, snapshot_path)
        
    last_notification["global"] = current_time
