"""
Database Connection & Engine Factory (Supports PostgreSQL/PostGIS and SQLite).
Resilient for local development and Serverless / Vercel cloud environments.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from backend.app.config import settings
from backend.app.models.db_models import Base

DATABASE_URL = settings.DATABASE_URL

# In serverless environments (like Vercel), ensure database directory is writable or fallback gracefully
if DATABASE_URL.startswith("sqlite"):
    db_path = DATABASE_URL.replace("sqlite:///", "")
    if db_path and not db_path.startswith(":memory:"):
        db_dir = os.path.dirname(os.path.abspath(db_path))
        try:
            os.makedirs(db_dir, exist_ok=True)
        except Exception:
            # Fallback to /tmp in read-only serverless filesystems
            DATABASE_URL = "sqlite:////tmp/nowcast_local.db"

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

try:
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        echo=False,
    )
except Exception:
    # Safe memory fallback for serverless cold-starts
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        echo=False,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
