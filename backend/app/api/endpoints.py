"""
REST Endpoints for Convective Nowcasting System.
"""

from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Dict, Any, Optional

from ..models.schemas import (
    LocationRequest,
    NowcastResponse,
    ScenarioSelectRequest,
    ScenarioInfo,
    AlertItem,
    StormCellDetail,
    TimelineStep,
)
from ..services.nowcast_service import nowcast_service

router = APIRouter()

@router.get("/health")
async def health_check():
    """
    Health and diagnostic endpoint.
    """
    return {
        "status": "healthy",
        "service": "SIH26084 Convective-Scale Nowcasting Engine",
        "provider_mode": nowcast_service.current_provider_mode,
        "demo_scenario": nowcast_service.mock_provider.scenario,
        "timestamp_utc": nowcast_service.risk_engine.version,
    }

@router.post("/nowcast", response_model=NowcastResponse)
async def generate_nowcast(req: LocationRequest):
    """
    Primary endpoint: generates a full localized nowcast strictly for the provided GPS coordinates.
    """
    try:
        nowcast = await nowcast_service.generate_nowcast(
            lat=req.latitude,
            lon=req.longitude,
            accuracy_m=req.accuracy_m,
        )
        return nowcast
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Nowcast computation error: {str(e)}")

@router.get("/alerts", response_model=List[AlertItem])
async def get_alerts(lat: float = Query(..., ge=-90, le=90), lon: float = Query(..., ge=-180, le=180)):
    """
    Returns active alerts for coordinates.
    """
    nowcast = await nowcast_service.generate_nowcast(lat=lat, lon=lon)
    return nowcast.active_alerts

@router.get("/storm-cells", response_model=List[StormCellDetail])
async def get_storm_cells(lat: float = Query(..., ge=-90, le=90), lon: float = Query(..., ge=-180, le=180)):
    """
    Returns tracked storm cell centroids, advection vectors, and projected polygons.
    """
    nowcast = await nowcast_service.generate_nowcast(lat=lat, lon=lon)
    return nowcast.storm_cells

@router.get("/timeline", response_model=List[TimelineStep])
async def get_timeline(lat: float = Query(..., ge=-90, le=90), lon: float = Query(..., ge=-180, le=180)):
    """
    Returns 0-60 minute stepped risk timeline.
    """
    nowcast = await nowcast_service.generate_nowcast(lat=lat, lon=lon)
    return nowcast.timeline

@router.get("/scenarios", response_model=List[ScenarioInfo])
async def list_scenarios():
    """
    Returns list of deterministic convective scenarios for SIH demo.
    """
    return nowcast_service.list_available_scenarios()

@router.post("/scenarios/select")
async def select_scenario(req: ScenarioSelectRequest):
    """
    Allows developers / judges to switch the demo scenario.
    """
    nowcast_service.set_demo_scenario(req.scenario)
    
    response = {
        "status": "scenario_updated",
        "scenario": req.scenario,
    }
    
    if req.latitude is not None and req.longitude is not None:
        nowcast = await nowcast_service.generate_nowcast(lat=req.latitude, lon=req.longitude)
        response["nowcast"] = nowcast.model_dump()
        
    return response

@router.post("/provider/mode")
async def set_provider_mode(mode: str = Query(..., enum=["demo", "live"])):
    """
    Switches weather provider between 'demo' and 'live'.
    """
    nowcast_service.set_provider_mode(mode)
    return {
        "status": "provider_mode_updated",
        "provider_mode": nowcast_service.current_provider_mode,
    }
