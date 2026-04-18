import sqlite3
import os

DB_PATH = os.path.join("database", "traffic.db")

def init_db():
    """Initializes the SQLite database and creates the vehicle_crossings table."""
    # Ensure directory exists
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS vehicle_crossings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vehicle_type TEXT NOT NULL,
            plate_number TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            direction TEXT DEFAULT 'Inbound'
        )
    """)
    conn.commit()
    conn.close()
    print("Database initialized successfully.")
