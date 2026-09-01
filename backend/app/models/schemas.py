"""
Pydantic Schemas for Convective Nowcasting API.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class LocationRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude from browser GPS")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude from browser GPS")
    accuracy_m: Optional[float] = Field(None, description="GPS location accuracy in meters")
    altitude_m: Optional[float] = Field(None, description="GPS altitude if available")
    timestamp_epoch: Optional[float] = Field(None, description="Client GPS acquisition timestamp")

class HazardDetail(BaseModel):
    risk_level: str = Field(..., description="LOW, MODERATE, HIGH, SEVERE")
    probability: float = Field(..., description="Occurrence probability (0-100%)")
    confidence: int = Field(..., description="Model confidence score (0-100%)")
    trend: str = Field(..., description="DECREASING, STABLE, INCREASING, RAPIDLY_INTENSIFYING")

class HazardsSummary(BaseModel):
    thunderstorm: HazardDetail
    hail: HazardDetail
    cloudburst: HazardDetail

class TimelineStep(BaseModel):
    time_offset_min: int
    label: str
    thunderstorm_probability: float
    hail_probability: float
    cloudburst_probability: float
    rainfall_intensity_mm_h: float
    radar_reflectivity_dbz: float
    overall_risk: str
    nearest_cell_distance_km: Optional[float] = None

class ExplainabilityFactor(BaseModel):
    name: str
    metric: str
    status: str
    severity: str
    description: str

class StormCellDetail(BaseModel):
    cell_id: str
    centroid_lat: float
    centroid_lon: float
    max_dbz: float
    speed_kmh: float
    bearing_deg: float
    echo_top_km: float
    vil_kg_m2: float
    area_sq_km: float
    distance_to_user_km: float
    is_approaching: bool
    estimated_arrival_min: Optional[int] = None
    polygons_by_time: Dict[str, List[List[float]]]

class AlertItem(BaseModel):
    alert_id: str
    hazard_type: str
    priority: str  # WATCH, WARNING, SEVERE
    title: str
    message: str
    issued_at: str
    expires_at: str
    acknowledged: bool = False
    affected_radius_km: float

class NowcastResponse(BaseModel):
    status: str = "success"
    provider_mode: str  # "demo" or "live"
    scenario: Optional[str] = None
    generated_at: str
    coordinates: Dict[str, float]
    hazards: HazardsSummary
    atmospheric_metrics: Dict[str, Any]
    timeline: List[TimelineStep]
    explainability: List[ExplainabilityFactor]
    storm_cells: List[StormCellDetail]
    active_alerts: List[AlertItem]

class ScenarioSelectRequest(BaseModel):
    scenario: str = Field(..., description="NORMAL, DEVELOPING_STORM, SEVERE_CONVECTIVE_EVENT")
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ScenarioInfo(BaseModel):
    id: str
    name: str
    description: str
    expected_severity: str
    cell_count: int
