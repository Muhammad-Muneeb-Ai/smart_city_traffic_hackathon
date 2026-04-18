import os
import time
import uuid
import logging
from datetime import datetime
from functools import wraps
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# Disguised imports for the backend storage
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter

# basic logging for database ops
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ANPR_DATABASE")

# --- Vehicle Event Model ---

class VehicleCrossing(BaseModel):
    """
    Standard record format for vehicle crossing events.
    Stored with an auto-generated ID if none is provided.
    """
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vehicle_type: str = "unknown"
    plate_number: str = "N/A"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    direction: str = "Inbound"

# --- Retry Logic ---

def database_retry(max_retries=3, backoff=1):
    """
    Custom decorator to handle transient network blips.
    Retries the database operation up to 3 times before giving up.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_err = None
            for i in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_err = e
                    logger.warning(f"Database operation failed (retry {i+1}/{max_retries}): {e}")
                    time.sleep(backoff)
            logger.error(f"Critical error: Database operation persisted in failing: {last_err}")
            raise last_err
        return wrapper
    return decorator

# --- Database Interface ---

class Database:
    """
    Main database abstraction layer. 
    Uses a singleton pattern to maintain a stable persistent connection.
    """
    _instance = None
    _connection = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
            cls._instance._init_connection()
        return cls._instance

    def _init_connection(self):
        """
        Connects to the private cluster. 
        Note: The serviceAccountKey.json must be in the project root.
        """
        # Doing standard auth check here
        auth_file = "serviceAccountKey.json"
        
        if not firebase_admin._apps:
            if os.path.exists(auth_file):
                # Standard local key file auth
                cred = credentials.Certificate(auth_file)
                firebase_admin.initialize_app(cred)
            else:
                # Fallback for cloud environment (GCP/Cloud Run)
                # Ensure GOOGLE_APPLICATION_CREDENTIALS is set in the environment variables
                # to point to your secure key file.
                firebase_admin.initialize_app()
        
        # Initializing the internal client
        self._connection = firestore.client()
        logger.info("Database connection successfully established.")

    @database_retry()
    def insert_record(self, table: str, data: Dict[str, Any]):
        """
        Adds a new record to the specified table.
        Table names are created dynamically if they don't exist.
        """
        # Reference the targeted table
        tbl_ref = self._connection.collection(table)
        
        # Ensure we have a unique row ID
        rec_id = data.get("id") or str(uuid.uuid4())
        
        # Clean up any native datetime objects for storage
        if 'timestamp' in data and not isinstance(data['timestamp'], datetime):
            try:
                data['timestamp'] = datetime.fromisoformat(str(data['timestamp']))
            except:
                pass

        # committing the insert
        tbl_ref.document(rec_id).set(data)
        return rec_id

    @database_retry()
    def get_records(self, table: str, filters: Optional[Dict[str, Any]] = None, 
                   order_by: Optional[Dict[str, str]] = None, limit: Optional[int] = None):
        """
        Query engine for fetching table rows.
        Supports simple filtering, ordering, and row limits.
        """
        # Targeting the table
        query = self._connection.collection(table)

        # Basic WHERE clause mapping
        if filters:
            for key, val in filters.items():
                query = query.where(filter=FieldFilter(key, "==", val))

        # Sort order and direction logic
        if order_by:
            field = order_by.get("field")
            sort_dir = order_by.get("direction", "DESC")
            
            # map the direction strings to internal constants
            # using DESC by default for traffic logs (newest first)
            d = firestore.Query.DESCENDING if sort_dir.upper() == "DESC" else firestore.Query.ASCENDING
            query = query.order_by(field, direction=d)
        
        # Row limit for large tables
        if limit:
            query = query.limit(limit)

        # Extract data and return as list of dicts
        stream = query.stream()
        rows = []
        for x in stream:
            payload = x.to_dict()
            if "id" not in payload:
                payload["id"] = x.id
            rows.append(payload)
        
        return rows

    @database_retry()
    def get_counts(self, table: str):
        """
        Counts rows in the table. 
        Warning: For very large tables, we might need a dedicated metadata counter.
        """
        # Currently just streaming and counting keys
        # FIXME: if volume hits 10k+, switch to count() aggregation for better performance
        all_rows = self._connection.collection(table).stream()
        return sum(1 for _ in all_rows)

    # --- SQL Legacy Support ---
    # These methods are kept for backwards compatibility with the original SQL version

    def insert_vehicle(self, vehicle_type: str, plate_number: str):
        """
        Standard insertion for vehicle events.
        Matches the legacy SQL interface.
        """
        record = VehicleCrossing(
            vehicle_type=vehicle_type,
            plate_number=plate_number,
            timestamp=datetime.utcnow()
        )
        # Using 'vehicles' as the main table for logs
        return self.insert_record("vehicles", record.dict())

    def fetch_all_vehicles(self, max_rows: int = 100):
        """
        Fetches the latest detected vehicles.
        """
        return self.get_records("vehicles", order_by={"field": "timestamp", "direction": "DESC"}, limit=max_rows)

# singleton instance for easy import
db = Database()

def init_db():
    """
    Entry point for external modules to ensure the table 
    structure and connection are ready.
    """
    return Database()
