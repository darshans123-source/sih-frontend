"""
Database Initialization Helper.
"""

from .connection import engine
from backend.app.models.db_models import Base
import logging

logger = logging.getLogger(__name__)

def init_db():
    logger.info("Creating database tables if not present...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database schema initialized successfully.")

if __name__ == "__main__":
    init_db()
