"""
Deterministic Convective Scenario Mock Weather Provider.
Generates realistic physical meteorological scenarios anchored around the user's exact GPS location.
"""

from typing import List, Dict, Any
import math
import time
from .base import BaseWeatherProvider
from ml.features.atmospheric_features import AtmosphericMetrics
from ml.preprocessing.radar_sounding import StormCellCluster

class MockWeatherProvider(BaseWeatherProvider):
    """
    Deterministic physical convective weather simulator for SIH demonstrations.
    """

    def __init__(self, scenario: str = "SEVERE_CONVECTIVE_EVENT"):
        self.scenario = scenario

    @property
    def provider_name(self) -> str:
        return "Deterministic Convective Simulation Engine (Demo)"

    @property
    def is_live_feed(self) -> bool:
        return False

    def set_scenario(self, scenario: str):
        valid = ["NORMAL", "DEVELOPING_STORM", "SEVERE_CONVECTIVE_EVENT"]
        if scenario in valid:
            self.scenario = scenario
        else:
            self.scenario = "SEVERE_CONVECTIVE_EVENT"

    async def fetch_atmospheric_metrics(self, lat: float, lon: float) -> AtmosphericMetrics:
        # Time-based smooth micro-variation (period ~ 600s)
        t_phase = math.sin(time.time() / 100.0) * 0.05

        if self.scenario == "NORMAL":
            return AtmosphericMetrics(
                cape_j_kg=round(380.0 + t_phase * 20.0, 1),
                cin_j_kg=round(-120.0 + t_phase * 10.0, 1),
                lifted_index_c=round(3.4 + t_phase * 0.2, 1),
                k_index=round(18.5 + t_phase * 0.5, 1),
                precipitable_water_mm=round(24.0 + t_phase * 1.0, 1),
                bulk_shear_0_6km_mps=round(6.5 + t_phase * 0.3, 1),
                freezing_level_m=round(4800.0, 1),
                surface_temp_c=round(31.2 + t_phase * 0.2, 1),
                surface_dewpoint_c=round(16.5 + t_phase * 0.2, 1),
                surface_pressure_hpa=round(1013.2, 1),
                radar_reflectivity_dbz=round(max(0.0, 8.0 + t_phase * 2.0), 1),
                echo_top_height_km=round(2.5, 1),
                vertically_integrated_liquid_kg_m2=round(0.5, 1),
            )

        elif self.scenario == "DEVELOPING_STORM":
            return AtmosphericMetrics(
                cape_j_kg=round(1650.0 + t_phase * 50.0, 1),
                cin_j_kg=round(-32.0 + t_phase * 5.0, 1),
                lifted_index_c=round(-3.2 + t_phase * 0.2, 1),
                k_index=round(33.0 + t_phase * 0.5, 1),
                precipitable_water_mm=round(42.5 + t_phase * 1.5, 1),
                bulk_shear_0_6km_mps=round(14.8 + t_phase * 0.5, 1),
                freezing_level_m=round(4200.0, 1),
                surface_temp_c=round(29.8 + t_phase * 0.3, 1),
                surface_dewpoint_c=round(23.4 + t_phase * 0.3, 1),
                surface_pressure_hpa=round(1008.6, 1),
                radar_reflectivity_dbz=round(42.0 + t_phase * 2.0, 1),
                echo_top_height_km=round(9.8 + t_phase * 0.3, 1),
                vertically_integrated_liquid_kg_m2=round(24.5 + t_phase * 1.0, 1),
            )

        else:  # SEVERE_CONVECTIVE_EVENT
            return AtmosphericMetrics(
                cape_j_kg=round(2850.0 + t_phase * 80.0, 1),
                cin_j_kg=round(-12.0 + t_phase * 3.0, 1),
                lifted_index_c=round(-7.1 + t_phase * 0.3, 1),
                k_index=round(41.5 + t_phase * 0.6, 1),
                precipitable_water_mm=round(58.0 + t_phase * 1.8, 1),
                bulk_shear_0_6km_mps=round(23.5 + t_phase * 0.8, 1),
                freezing_level_m=round(3800.0, 1),
                surface_temp_c=round(27.4 + t_phase * 0.4, 1),
                surface_dewpoint_c=round(25.1 + t_phase * 0.3, 1),
                surface_pressure_hpa=round(1002.4, 1),
                radar_reflectivity_dbz=round(59.5 + t_phase * 2.5, 1),
                echo_top_height_km=round(15.2 + t_phase * 0.4, 1),
                vertically_integrated_liquid_kg_m2=round(54.0 + t_phase * 2.0, 1),
            )

    async def fetch_storm_cells(self, lat: float, lon: float) -> List[StormCellCluster]:
        """
        Generates realistic localized storm cells oriented around the user's GPS coords.
        """
        cells = []
        
        # Approximate offset in degrees: ~0.01 deg is ~1.11 km
        if self.scenario == "NORMAL":
            return []  # No convective cells within 100km

        elif self.scenario == "DEVELOPING_STORM":
            # 1 cell approaching from SW (bearing 45 deg, moving NE)
            # Offset ~16km away: lat -0.11, lon -0.11
            cell1 = StormCellCluster(
                cell_id="CELL-DEV-01",
                centroid_lat=round(lat - 0.11, 5),
                centroid_lon=round(lon - 0.11, 5),
                max_dbz=48.5,
                speed_kmh=36.0,
                bearing_deg=45.0,
                echo_top_km=10.2,
                vil_kg_m2=28.0,
                area_sq_km=65.0,
            )
            # 1 smaller flanking cell ~28km NW
            cell2 = StormCellCluster(
                cell_id="CELL-DEV-02",
                centroid_lat=round(lat + 0.18, 5),
                centroid_lon=round(lon - 0.16, 5),
                max_dbz=41.0,
                speed_kmh=32.0,
                bearing_deg=65.0,
                echo_top_km=8.5,
                vil_kg_m2=18.0,
                area_sq_km=42.0,
            )
            cells.extend([cell1, cell2])

        else:  # SEVERE_CONVECTIVE_EVENT
            # Primary Severe Supercell / Cloudburst Core: 9km to SW heading straight toward user
            cell_main = StormCellCluster(
                cell_id="CELL-SEV-ALPHA",
                centroid_lat=round(lat - 0.065, 5),
                centroid_lon=round(lon - 0.055, 5),
                max_dbz=63.5,
                speed_kmh=42.0,
                bearing_deg=48.0,
                echo_top_km=15.8,
                vil_kg_m2=58.0,
                area_sq_km=110.0,
            )
            # Secondary Hail Core: 15km to West
            cell_hail = StormCellCluster(
                cell_id="CELL-HAIL-BRAVO",
                centroid_lat=round(lat - 0.02, 5),
                centroid_lon=round(lon - 0.14, 5),
                max_dbz=57.0,
                speed_kmh=38.0,
                bearing_deg=55.0,
                echo_top_km=14.1,
                vil_kg_m2=48.0,
                area_sq_km=75.0,
            )
            # Trailing intense outflow boundary / convective line: 22km to South
            cell_squall = StormCellCluster(
                cell_id="CELL-SQ-CHARLIE",
                centroid_lat=round(lat - 0.19, 5),
                centroid_lon=round(lon - 0.02, 5),
                max_dbz=51.0,
                speed_kmh=46.0,
                bearing_deg=35.0,
                echo_top_km=12.5,
                vil_kg_m2=36.0,
                area_sq_km=90.0,
            )
            cells.extend([cell_main, cell_hail, cell_squall])

        return cells
