"""
Automated Backend & ML Risk Engine Verification Test.
"""

import asyncio
import sys
import os

# Set sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.features.atmospheric_features import AtmosphericMetrics, compute_convective_indices
from ml.preprocessing.radar_sounding import StormCellCluster, compute_distance_km
from ml.risk_engine import ConvectiveRiskEngine
from app.services.nowcast_service import nowcast_service
from app.providers.mock_provider import MockWeatherProvider
from database.init_db import init_db

async def run_tests():
    print("=== 1. Initializing Database ===")
    init_db()
    print("Database initialization PASS.")

    print("\n=== 2. Testing ML Convective Calculation ===")
    metrics = AtmosphericMetrics(
        cape_j_kg=2850.0,
        cin_j_kg=-15.0,
        lifted_index_c=-7.0,
        k_index=42.0,
        precipitable_water_mm=58.0,
        bulk_shear_0_6km_mps=24.0,
        freezing_level_m=3800.0,
        surface_temp_c=28.0,
        surface_dewpoint_c=25.0,
        surface_pressure_hpa=1004.0,
        radar_reflectivity_dbz=62.0,
        echo_top_height_km=15.0,
        vertically_integrated_liquid_kg_m2=56.0,
    )
    indices = compute_convective_indices(metrics)
    print("Computed Convective Indices:", indices)
    assert indices["thunderstorm_score"] > 60.0
    assert indices["hail_score"] > 50.0
    assert indices["cloudburst_score"] > 60.0
    print("ML Atmospheric Features PASS.")

    print("\n=== 3. Testing Radar Advection & Polygon Projection ===")
    cell = StormCellCluster(
        cell_id="CELL-TEST-01",
        centroid_lat=28.60,
        centroid_lon=77.20,
        max_dbz=60.0,
        speed_kmh=40.0,
        bearing_deg=45.0,
        echo_top_km=14.0,
        vil_kg_m2=50.0,
        area_sq_km=80.0,
    )
    p0 = cell.generate_polygon(0)
    p30 = cell.generate_polygon(30)
    p60 = cell.generate_polygon(60)
    assert len(p0) == 9
    assert len(p30) == 9
    assert len(p60) == 9
    print(f"Projected cell at 0m: {p0[0]} -> 30m: {p30[0]} -> 60m: {p60[0]}")
    print("Radar Advection PASS.")

    print("\n=== 4. Testing End-to-End Nowcast Service ===")
    user_lat, user_lon = 28.6139, 77.2090
    
    # Test Severe Convective Event
    nowcast_service.set_demo_scenario("SEVERE_CONVECTIVE_EVENT")
    res_severe = await nowcast_service.generate_nowcast(user_lat, user_lon)
    print(f"Severe Scenario Generated At: {res_severe.generated_at}")
    print(f"Hazards: T-Storm: {res_severe.hazards.thunderstorm.risk_level} ({res_severe.hazards.thunderstorm.probability}%), Hail: {res_severe.hazards.hail.risk_level}, Cloudburst: {res_severe.hazards.cloudburst.risk_level}")
    print(f"Active Alerts Count: {len(res_severe.active_alerts)}")
    print(f"Storm Cells Tracked: {len(res_severe.storm_cells)}")
    assert len(res_severe.timeline) == 5
    assert len(res_severe.explainability) >= 4
    assert res_severe.hazards.thunderstorm.risk_level in ["HIGH", "SEVERE"]

    # Test Normal Scenario
    nowcast_service.set_demo_scenario("NORMAL")
    res_normal = await nowcast_service.generate_nowcast(user_lat, user_lon)
    print(f"\nNormal Scenario Hazards: T-Storm: {res_normal.hazards.thunderstorm.risk_level} ({res_normal.hazards.thunderstorm.probability}%)")
    assert res_normal.hazards.thunderstorm.risk_level == "LOW"
    print("Nowcast Service Verification PASS.")

    print("\n==========================================")
    print("ALL BACKEND & ML TESTS PASSED SUCCESSFULLY")
    print("==========================================")

if __name__ == "__main__":
    asyncio.run(run_tests())
