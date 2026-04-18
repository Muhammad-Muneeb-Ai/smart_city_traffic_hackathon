from fastapi import FastAPI
from pydantic import BaseModel
from database import init_db
import sqlite3
import os

app = FastAPI()

class VehicleEvent(BaseModel):
    vehicle_type: str
    plate_number: str
    direction: str = "Inbound"

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def read_root():
    return {"status": "ANPR Traffic System Online"}

@app.post("/vehicle")
def add_vehicle(event: VehicleEvent):
    from database import DB_PATH
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO vehicle_crossings (vehicle_type, plate_number, direction) VALUES (?, ?, ?)",
        (event.vehicle_type, event.plate_number, event.direction)
    )
    conn.commit()
    conn.close()
    return {"message": "Event recorded"}

@app.get("/vehicles")
def get_vehicles():
    from database import DB_PATH
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vehicle_crossings ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]
