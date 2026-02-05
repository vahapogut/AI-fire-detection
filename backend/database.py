import sqlite3
import os
from datetime import datetime

DB_NAME = "fire_guard.db"

def init_db():
    """Initialize the database and create tables if they don't exist."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Create events table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        type TEXT NOT NULL,
        confidence REAL NOT NULL,
        snapshot_path TEXT
    )
    ''')
    
    conn.commit()
    conn.close()
    print(f"Database {DB_NAME} initialized.")

def add_event(type, confidence, snapshot_path=None):
    """Add a new event to the database."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    cursor.execute('''
    INSERT INTO events (timestamp, type, confidence, snapshot_path)
    VALUES (?, ?, ?, ?)
    ''', (timestamp, type, confidence, snapshot_path))
    
    conn.commit()
    event_id = cursor.lastrowid
    conn.close()
    return event_id, timestamp

def get_recent_events(limit=50):
    """Get the most recent events."""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row # Access columns by name
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT * FROM events ORDER BY id DESC LIMIT ?
    ''', (limit,))
    
    rows = cursor.fetchall()
    events = [dict(row) for row in rows]
    conn.close()
    return events

def get_daily_stats(days=7):
    """Get event counts for the last N days."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Query to count events per day
    cursor.execute('''
    SELECT SUBSTR(timestamp, 1, 10) as date, COUNT(*) as count 
    FROM events 
    WHERE timestamp >= date('now', ?) 
    GROUP BY date 
    ORDER BY date ASC
    ''', (f'-{days} days',))
    
    rows = cursor.fetchall()
    stats = [{"date": row[0], "count": row[1]} for row in rows]
    conn.close()
    return stats

def get_all_events(limit=100, offset=0):
    """Get all events with pagination."""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT * FROM events ORDER BY id DESC LIMIT ? OFFSET ?
    ''', (limit, offset))
    
    rows = cursor.fetchall()
    events = [dict(row) for row in rows]
    conn.close()
    return events

# Settings Handling
def get_setting(key, default=None):
    """Get a setting value by key."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Create valid table if not exists (lazy init for settings)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )
    ''')
    
    cursor.execute('SELECT value FROM settings WHERE key = ?', (key,))
    row = cursor.fetchone()
    conn.close()
    
    return row[0] if row else default

def set_setting(key, value):
    """Set a setting value."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )
    ''')
    
    cursor.execute('''
    INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)
    ''', (key, value))
    
    conn.commit()
    conn.close()

def get_all_settings():
    """Get all settings as a dictionary."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )
    ''')
    
    cursor.execute('SELECT key, value FROM settings')
    rows = cursor.fetchall()
    conn.close()
    
    return {row[0]: row[1] for row in rows}
