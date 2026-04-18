import sqlite3
import os
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# Local SQLite Database Path
DB_DIR = "database"
DB_NAME = "traffic_monitoring.db"
DB_PATH = os.path.join(DB_DIR, DB_NAME)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TRAFFIC_DB")

class VehicleCrossing(BaseModel):
    vehicle_type: str
    plate_number: str = "NOT_DETECTED"
    timestamp: datetime = Field(default_factory=datetime.now)

class Database:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
            cls._instance._init_db()
        return cls._instance

    def _init_db(self):
        """Initializes the SQLite database and ensures the table exists."""
        if not os.path.exists(DB_DIR):
            os.makedirs(DB_DIR)
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS vehicle_crossings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vehicle_type TEXT NOT NULL,
                plate_number TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                direction TEXT DEFAULT 'Inbound'
            )
        ''')
        conn.commit()
        conn.close()
        logger.info("Database initialized successfully.")

    def insert_vehicle(self, vehicle_type: str, plate_number: str, direction: str = "Inbound"):
        """Inserts a crossing record into the database."""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO vehicle_crossings (vehicle_type, plate_number, direction, timestamp)
            VALUES (?, ?, ?, ?)
        ''', (vehicle_type, plate_number, direction, datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
        conn.commit()
        conn.close()
        return True

    def fetch_all_vehicles(self, limit: int = 100):
        """Fetches the latest vehicle records."""
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(f"SELECT * FROM vehicle_crossings ORDER BY timestamp DESC LIMIT {limit}")
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return rows

    def get_stats(self):
        """Returns counts grouped by vehicle type."""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT vehicle_type, count(*) as count FROM vehicle_crossings GROUP BY vehicle_type")
        records = cursor.fetchall()
        conn.close()
        return {item[0]: item[1] for item in records}

# Singleton instance
db = Database()

def init_db():
    return Database()
