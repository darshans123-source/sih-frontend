"""
FastAPI Main Application Entry Point.
SIH26084 Convective-Scale Nowcasting for Thunderstorms, Hail, and Cloudbursts.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from contextlib import asynccontextmanager

from .config import settings
from .api.endpoints import router as api_router
from .api.websocket import ws_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME}...")
    logger.info(f"Provider: {settings.WEATHER_PROVIDER} | Scenario: {settings.DEMO_SCENARIO}")
    yield
    logger.info("Shutting down nowcasting services.")

app = FastAPI(
    title=settings.APP_NAME,
    description="Operational Convective-Scale Nowcasting for Thunderstorms, Hail, and Cloudbursts (SIH26084)",
    version="2.4.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api_router, prefix=settings.API_V1_PREFIX)
app.include_router(ws_router, prefix=settings.API_V1_PREFIX)

@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "status": "online",
        "api_docs": "/docs",
        "health_check": f"{settings.API_V1_PREFIX}/health",
    }
