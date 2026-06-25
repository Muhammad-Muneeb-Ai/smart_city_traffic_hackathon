import os
import logging
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, func
from sqlalchemy.orm import declarative_base, sessionmaker

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TRAFFIC_DB")

Base = declarative_base()

# --- Table Schema for Production Cloud SQL / SQLite ---
class TrafficLog(Base):
    """
    Traffic Logs Table representing vehicle crossings.
    Columns:
      - id (Primary Key)
      - vehicle_type
      - license_plate
      - timestamp
      - direction (Optional, for dashboard logs)
      - speed (Optional, for speed analytics)
    """
    __tablename__ = 'traffic_logs'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    vehicle_type = Column(String(50), nullable=False)
    license_plate = Column(String(50), default="Unknown", nullable=False)
    timestamp = Column(DateTime, default=datetime.now, nullable=False)
    direction = Column(String(50), default="Inbound", nullable=True)
    speed = Column(Float, default=0.0, nullable=True)

class Database:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
            cls._instance._init_db()
        return cls._instance

    def _init_db(self):
        """Initializes the database connection using SQLAlchemy."""
        # Retrieve production connection parameters
        db_user = os.environ.get("DB_USER")
        db_pass = os.environ.get("DB_PASSWORD") or os.environ.get("DB_PASS")
        db_name = os.environ.get("DB_NAME", "traffic_monitoring")
        db_host = os.environ.get("DB_HOST")
        db_port = os.environ.get("DB_PORT")
        db_dialect = os.environ.get("DB_DIALECT", "postgresql+psycopg2") # e.g., postgresql+psycopg2 or mysql+pymysql
        db_url_env = os.environ.get("DATABASE_URL") # fallback to direct connection string

        self.is_production_db = False
        self.engine = None

        # Build connection URL if parameters are available
        if db_url_env:
            connection_url = db_url_env
            self.is_production_db = True
        elif db_user and db_pass and db_host:
            port_str = f":{db_port}" if db_port else ""
            connection_url = f"{db_dialect}://{db_user}:{db_pass}@{db_host}{port_str}/{db_name}"
            self.is_production_db = True
        else:
            connection_url = None

        if self.is_production_db:
            try:
                logger.info(f"Connecting to Cloud SQL via SQLAlchemy ({db_dialect})...")
                self.engine = create_engine(
                    connection_url,
                    pool_size=5,
                    max_overflow=10,
                    pool_timeout=30,
                    pool_recycle=1800
                )
                # Verify connection
                with self.engine.connect() as conn:
                    pass
                logger.info("Successfully connected to production Cloud SQL database!")
            except Exception as e:
                logger.error(f"Failed to connect to Cloud SQL: {e}. Falling back to SQLite...")
                self.is_production_db = False

        if not self.is_production_db:
            # Fallback to local SQLite database
            logger.info("Using local SQLite database fallback...")
            db_dir = "database"
            if not os.path.exists(db_dir):
                os.makedirs(db_dir)
            sqlite_path = os.path.join(db_dir, "traffic_monitoring.db")
            self.engine = create_engine(f"sqlite:///{sqlite_path}")

        # Create tables automatically if they do not exist
        try:
            Base.metadata.create_all(self.engine)
            logger.info("Database schema (traffic_logs table) initialized successfully.")
        except Exception as e:
            logger.error(f"Error creating database schema: {e}")

        # Create Session Factory
        self.Session = sessionmaker(bind=self.engine)

    def insert_vehicle(self, vehicle_type: str, plate_number: str, direction: str = "Inbound", speed: float = 0.0):
        """Inserts a crossing record into the traffic_logs table."""
        session = self.Session()
        try:
            # Safe clean of license plate
            license_plate = plate_number if plate_number else "Unknown"
            
            log_entry = TrafficLog(
                vehicle_type=vehicle_type,
                license_plate=license_plate,
                timestamp=datetime.now(),
                direction=direction,
                speed=round(speed, 1)
            )
            session.add(log_entry)
            session.commit()
            logger.info(f"Logged vehicle: {vehicle_type} ({license_plate}) at {speed} km/h")
            return True
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to insert vehicle into database: {e}")
            return False
        finally:
            session.close()

    def fetch_all_vehicles(self, limit: int = 100):
        """Fetches the latest vehicle records."""
        session = self.Session()
        try:
            query_results = session.query(TrafficLog).order_by(TrafficLog.timestamp.desc()).limit(limit).all()
            records = []
            for item in query_results:
                records.append({
                    "id": item.id,
                    "vehicle_type": item.vehicle_type,
                    "plate_number": item.license_plate, # map to plate_number for legacy UI compatibility
                    "timestamp": item.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                    "direction": item.direction,
                    "speed": item.speed
                })
            return records
        except Exception as e:
            logger.error(f"Failed to fetch vehicle logs: {e}")
            return []
        finally:
            session.close()

    def get_stats(self):
        """Returns counts grouped by vehicle type."""
        session = self.Session()
        try:
            query = session.query(TrafficLog.vehicle_type, func.count(TrafficLog.id)).group_by(TrafficLog.vehicle_type).all()
            return {item[0]: item[1] for item in query}
        except Exception as e:
            logger.error(f"Failed to fetch traffic stats: {e}")
            return {}
        finally:
            session.close()

# Singleton instance for simple modular imports
db = Database()

def init_db():
    return Database()
