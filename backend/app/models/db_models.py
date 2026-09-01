"""
SQLAlchemy Models for Persistence (PostGIS / SQLite compatible).
"""

from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class LocationSession(Base):
    __tablename__ = "location_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    accuracy_m = Column(Float, nullable=True)
    altitude_m = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class NowcastSnapshot(Base):
    __tablename__ = "nowcast_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    provider = Column(String(32), default="demo")
    scenario = Column(String(64), nullable=True)
    hazard_summary = Column(JSON, nullable=False)
    atmospheric_metrics = Column(JSON, nullable=False)
    timeline_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class StormCellRecord(Base):
    __tablename__ = "storm_cells"

    id = Column(Integer, primary_key=True, index=True)
    cell_identifier = Column(String(32), index=True)
    centroid_lat = Column(Float, nullable=False)
    centroid_lon = Column(Float, nullable=False)
    max_dbz = Column(Float, nullable=False)
    speed_kmh = Column(Float, nullable=False)
    bearing_deg = Column(Float, nullable=False)
    echo_top_km = Column(Float, nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)

class AlertLog(Base):
    __tablename__ = "alerts_log"

    id = Column(Integer, primary_key=True, index=True)
    alert_uid = Column(String(64), unique=True, index=True)
    hazard_type = Column(String(32), nullable=False)
    priority = Column(String(16), nullable=False)  # WATCH, WARNING, SEVERE
    title = Column(String(128), nullable=False)
    message = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    affected_radius_km = Column(Float, default=25.0)
    acknowledged = Column(Boolean, default=False)
    issued_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
