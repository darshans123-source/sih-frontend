"""
Nowcast Orchestration Service.
Connects Weather Providers, ML Convective Risk Engine, and Alert Engine.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import logging

from ..config import settings
from ..models.schemas import (
    NowcastResponse,
    HazardsSummary,
    HazardDetail,
    TimelineStep,
    ExplainabilityFactor,
    StormCellDetail,
    AlertItem,
    ScenarioInfo,
)
from ..providers.mock_provider import MockWeatherProvider
from ..providers.open_meteo_provider import OpenMeteoWeatherProvider
from ..providers.base import BaseWeatherProvider
from ..core.alert_engine import ConvectiveAlertEngine
from ml.risk_engine import ConvectiveRiskEngine

logger = logging.getLogger(__name__)

class NowcastService:
    """
    Singleton service managing convective nowcasts.
    """

    def __init__(self):
        self.mock_provider = MockWeatherProvider(scenario=settings.DEMO_SCENARIO)
        self.live_provider = OpenMeteoWeatherProvider()
        self.risk_engine = ConvectiveRiskEngine()
        self.alert_engine = ConvectiveAlertEngine()
        self.current_provider_mode = settings.WEATHER_PROVIDER  # "demo" or "live"
        self._last_scores_cache: Dict[str, Dict[str, float]] = {}

    def set_provider_mode(self, mode: str):
        if mode in ["demo", "live"]:
            self.current_provider_mode = mode

    def set_demo_scenario(self, scenario: str):
        self.mock_provider.set_scenario(scenario)

    def get_current_provider(self) -> BaseWeatherProvider:
        if self.current_provider_mode == "live":
            return self.live_provider
        return self.mock_provider

    def list_available_scenarios(self) -> List[ScenarioInfo]:
        return [
            ScenarioInfo(
                id="NORMAL",
                name="Fair Weather / Normal",
                description="Low convective instability, stable atmospheric sounding, zero active cells.",
                expected_severity="LOW",
                cell_count=0,
            ),
            ScenarioInfo(
                id="DEVELOPING_STORM",
                name="Developing Convective Storm",
                description="Moderate CAPE (1650 J/kg), multicell initiation 15-25km upwind, moderate thunderstorm threat.",
                expected_severity="MODERATE",
                cell_count=2,
            ),
            ScenarioInfo(
                id="SEVERE_CONVECTIVE_EVENT",
                name="Severe Convective Event (Hail & Cloudburst)",
                description="High-end CAPE (2850 J/kg), deep shear, severe hail core (>60 dBZ), high cloudburst deluge risk.",
                expected_severity="SEVERE",
                cell_count=3,
            ),
        ]

    async def generate_nowcast(
        self,
        lat: float,
        lon: float,
        accuracy_m: Optional[float] = None,
    ) -> NowcastResponse:
        """
        Executes end-to-end convective nowcast for coordinates.
        """
        provider = self.get_current_provider()
        
        # 1. Fetch raw meteorological variables & radar cells
        metrics = await provider.fetch_atmospheric_metrics(lat, lon)
        storm_cells = await provider.fetch_storm_cells(lat, lon)

        # 2. Key cache for coordinate
        cache_key = f"{round(lat, 2)}_{round(lon, 2)}"
        prev_scores = self._last_scores_cache.get(cache_key)

        # 3. Evaluate through ML Convective Risk Engine
        engine_output = self.risk_engine.evaluate_location(
            lat=lat,
            lon=lon,
            metrics=metrics,
            storm_cells=storm_cells,
            previous_scores=prev_scores,
        )

        hazards_raw = engine_output["hazards"]
        self._last_scores_cache[cache_key] = {
            "tstorm": hazards_raw["thunderstorm"]["probability"],
            "hail": hazards_raw["hail"]["probability"],
            "cloudburst": hazards_raw["cloudburst"]["probability"],
        }

        # 4. Evaluate and generate alerts
        active_alerts = self.alert_engine.evaluate_alerts(
            lat=lat,
            lon=lon,
            hazards=hazards_raw,
            storm_cells=engine_output["storm_cells"],
            timeline=engine_output["timeline"],
        )

        # 5. Assemble structured response
        response = NowcastResponse(
            status="success",
            provider_mode=self.current_provider_mode,
            scenario=self.mock_provider.scenario if self.current_provider_mode == "demo" else "LIVE_ATMOSPHERE",
            generated_at=datetime.utcnow().isoformat() + "Z",
            coordinates={"latitude": lat, "longitude": lon, "accuracy_m": accuracy_m or 10.0},
            hazards=HazardsSummary(
                thunderstorm=HazardDetail(**hazards_raw["thunderstorm"]),
                hail=HazardDetail(**hazards_raw["hail"]),
                cloudburst=HazardDetail(**hazards_raw["cloudburst"]),
            ),
            atmospheric_metrics=engine_output["atmospheric_metrics"],
            timeline=[TimelineStep(**step) for step in engine_output["timeline"]],
            explainability=[ExplainabilityFactor(**factor) for factor in engine_output["explainability"]],
            storm_cells=[StormCellDetail(**cell) for cell in engine_output["storm_cells"]],
            active_alerts=active_alerts,
        )

        return response

nowcast_service = NowcastService()
