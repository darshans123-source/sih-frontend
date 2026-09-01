"""
Application Configuration and Settings.
Supports dynamic environment loading for Live vs Demo mode, database connections, and CORS origins.
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    APP_NAME: str = "SIH26084 Convective-Scale Nowcast Engine"
    API_V1_PREFIX: str = "/api"
    ENV: str = "development"
    DEBUG: bool = True
    
    # Provider Mode: "demo" or "live"
    WEATHER_PROVIDER: str = "demo"
    DEMO_SCENARIO: str = "SEVERE_CONVECTIVE_EVENT"  # NORMAL, DEVELOPING_STORM, SEVERE_CONVECTIVE_EVENT
    
    # Database URL: PostgreSQL or fallback SQLite
    DATABASE_URL: str = "sqlite:///./database/nowcast_local.db"
    
    # CORS settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Update frequencies (seconds)
    WS_HEARTBEAT_INTERVAL: int = 10
    NOWCAST_REFRESH_INTERVAL: int = 15
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
