"""
Atmospheric Features & Convective Index Calculations for Convective Nowcasting.
Implements standard operational meteorological thermodynamic and kinematic index evaluations.
"""

from typing import Dict, Any, Optional
import math
from pydantic import BaseModel, Field

class AtmosphericMetrics(BaseModel):
    cape_j_kg: float = Field(..., description="Convective Available Potential Energy (J/kg)")
    cin_j_kg: float = Field(..., description="Convective Inhibition (J/kg)")
    lifted_index_c: float = Field(..., description="Lifted Index (°C)")
    k_index: float = Field(..., description="K-Index for thunderstorm potential (°C)")
    precipitable_water_mm: float = Field(..., description="Total precipitable water in column (mm)")
    bulk_shear_0_6km_mps: float = Field(..., description="0-6km Bulk Wind Shear (m/s)")
    freezing_level_m: float = Field(..., description="Height of 0°C isotherm above ground level (m)")
    surface_temp_c: float = Field(..., description="Surface temperature (°C)")
    surface_dewpoint_c: float = Field(..., description="Surface dew point temperature (°C)")
    surface_pressure_hpa: float = Field(..., description="Surface atmospheric pressure (hPa)")
    radar_reflectivity_dbz: float = Field(..., description="Maximum column composite reflectivity (dBZ)")
    echo_top_height_km: float = Field(..., description="Radar Echo Top height (km)")
    vertically_integrated_liquid_kg_m2: float = Field(..., description="VIL (kg/m²)")

def compute_dewpoint_depression(temp_c: float, dewpoint_c: float) -> float:
    """Returns T - Td (°C)."""
    return max(0.0, temp_c - dewpoint_c)

def compute_relative_humidity(temp_c: float, dewpoint_c: float) -> float:
    """Computes approximate relative humidity % using Magnus-Tetens formula."""
    try:
        e = 6.112 * math.exp((17.67 * dewpoint_c) / (dewpoint_c + 243.5))
        es = 6.112 * math.exp((17.67 * temp_c) / (temp_c + 243.5))
        return min(100.0, max(0.0, (e / es) * 100.0))
    except Exception:
        return 75.0

def compute_convective_indices(metrics: AtmosphericMetrics) -> Dict[str, Any]:
    """
    Computes diagnostic convective indicators:
    - Severe Thunderstorm Index (STI)
    - Severe Hail Index (SHI)
    - Cloudburst Torrential Index (CTI)
    """
    cape = metrics.cape_j_kg
    cin = abs(metrics.cin_j_kg)
    shear = metrics.bulk_shear_0_6km_mps
    pwat = metrics.precipitable_water_mm
    li = metrics.lifted_index_c
    dbz = metrics.radar_reflectivity_dbz
    vil = metrics.vertically_integrated_liquid_kg_m2
    frz = metrics.freezing_level_m

    # 1. Thunderstorm Instability Score (0-100)
    # Strong when CAPE > 1500, LI < -3, CIN is low (< 50), Shear > 12 m/s
    cape_term = min(1.0, cape / 2500.0) * 40.0
    li_term = min(1.0, max(0.0, (-li + 2.0) / 8.0)) * 25.0
    cin_penalty = min(25.0, (cin / 100.0) * 25.0)
    shear_bonus = min(1.0, shear / 25.0) * 20.0
    radar_term = min(1.0, max(0.0, (dbz - 25.0) / 35.0)) * 15.0

    tstorm_raw = max(5.0, (cape_term + li_term + shear_bonus + radar_term - cin_penalty))
    tstorm_score = min(100.0, max(0.0, tstorm_raw))

    # 2. Hail Index (0-100)
    # Requires high CAPE in hail growth zone (-10°C to -30°C), freezing level not too high, strong shear and high VIL
    # VIL of 40+ kg/m² and dBZ > 50 strongly indicates severe hail
    vil_term = min(1.0, vil / 50.0) * 35.0
    dbz_hail_term = min(1.0, max(0.0, (dbz - 45.0) / 20.0)) * 30.0
    shear_hail = min(1.0, max(0.0, (shear - 10.0) / 20.0)) * 20.0
    frz_factor = 1.0 if frz < 4500 else max(0.2, (5500 - frz) / 1000.0)
    cape_hail = min(1.0, max(0.0, (cape - 1000.0) / 2000.0)) * 15.0

    hail_score = min(100.0, max(0.0, (vil_term + dbz_hail_term + shear_hail + cape_hail) * frz_factor))

    # 3. Cloudburst / Flash Deluge Index (0-100)
    # Defined by extreme instantaneous rainfall rate (>100 mm/h), high PWAT (>50mm), deep warm cloud layer, slow cell motion
    pwat_term = min(1.0, max(0.0, (pwat - 35.0) / 30.0)) * 35.0
    echo_top_term = min(1.0, max(0.0, (metrics.echo_top_height_km - 8.0) / 8.0)) * 25.0
    radar_deluge = min(1.0, max(0.0, (dbz - 40.0) / 25.0)) * 30.0
    k_term = min(1.0, max(0.0, (metrics.k_index - 28.0) / 15.0)) * 10.0

    cloudburst_score = min(100.0, max(0.0, pwat_term + echo_top_term + radar_deluge + k_term))

    return {
        "thunderstorm_score": round(tstorm_score, 1),
        "hail_score": round(hail_score, 1),
        "cloudburst_score": round(cloudburst_score, 1),
        "tstorm_probability": round(min(98.0, max(5.0, tstorm_score * 0.95 + 2.0)), 1),
        "hail_probability": round(min(95.0, max(0.0, hail_score * 0.9)), 1),
        "cloudburst_probability": round(min(92.0, max(0.0, cloudburst_score * 0.88)), 1),
    }
