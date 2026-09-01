"""
Nowcast Predictor and Explainability Engine.
Generates 0-60 minute stepped nowcast trajectories and physical explainability attribution.
"""

from typing import List, Dict, Any
from ..features.atmospheric_features import AtmosphericMetrics, compute_convective_indices
from ..models.severe_classifier import SevereConvectiveClassifier, score_to_risk_level
from ..preprocessing.radar_sounding import StormCellCluster, compute_distance_km

class NowcastPredictor:
    """
    Computes temporal advection and convective evolution at the user's exact GPS location.
    """

    @classmethod
    def generate_timeline(
        cls,
        metrics: AtmosphericMetrics,
        user_lat: float,
        user_lon: float,
        storm_cells: List[StormCellCluster],
    ) -> List[Dict[str, Any]]:
        """
        Generates 0, 15, 30, 45, 60 min nowcast predictions.
        """
        timeline = []
        indices = compute_convective_indices(metrics)

        # Baseline probabilities from column state
        base_tstorm = indices["tstorm_probability"]
        base_hail = indices["hail_probability"]
        base_cloudburst = indices["cloudburst_probability"]
        base_rain_rate = max(0.0, (metrics.radar_reflectivity_dbz - 15.0) * 1.5) if metrics.radar_reflectivity_dbz > 15 else 0.0

        for minutes in [0, 15, 30, 45, 60]:
            # Calculate proximity to nearest storm cell at lead time
            min_cell_dist = 999.0
            cell_influence_dbz = 0.0

            for cell in storm_cells:
                proj_lat, proj_lon = cell.project_position(minutes)
                dist = compute_distance_km(user_lat, user_lon, proj_lat, proj_lon)
                if dist < min_cell_dist:
                    min_cell_dist = dist
                    # Attenuate dBZ with distance
                    radius_km = (cell.area_sq_km / 3.14159) ** 0.5
                    if dist <= radius_km:
                        cell_influence_dbz = cell.max_dbz
                    elif dist <= radius_km * 2.5:
                        cell_influence_dbz = cell.max_dbz * (1.0 - (dist - radius_km) / (radius_km * 1.5))

            # Blend ambient thermodynamics with cell kinematics
            if min_cell_dist < 12.0:
                proximity_multiplier = 1.0 + max(0.0, (12.0 - min_cell_dist) / 12.0) * 0.45
            else:
                proximity_multiplier = max(0.4, 1.0 - (min_cell_dist - 12.0) / 40.0)

            tstorm_p = min(99.0, max(5.0, base_tstorm * proximity_multiplier))
            hail_p = min(95.0, max(0.0, base_hail * proximity_multiplier))
            cloudburst_p = min(92.0, max(0.0, base_cloudburst * proximity_multiplier))

            # Marshall-Palmer Z-R relationship approx for rain rate
            effective_dbz = max(metrics.radar_reflectivity_dbz, cell_influence_dbz)
            if effective_dbz > 20.0:
                # Z = 200 * R^1.6 -> R = (10^(dBZ/10) / 200)^(1/1.6)
                z = 10.0 ** (effective_dbz / 10.0)
                rain_rate = round(max(0.0, (z / 200.0) ** (1.0 / 1.6)), 1)
            else:
                rain_rate = 0.0

            composite_score = (tstorm_p * 0.45 + hail_p * 0.25 + cloudburst_p * 0.30)
            risk_lvl = score_to_risk_level(composite_score).value

            timeline.append({
                "time_offset_min": minutes,
                "label": "NOW" if minutes == 0 else f"+{minutes} MIN",
                "thunderstorm_probability": round(tstorm_p, 1),
                "hail_probability": round(hail_p, 1),
                "cloudburst_probability": round(cloudburst_p, 1),
                "rainfall_intensity_mm_h": rain_rate,
                "radar_reflectivity_dbz": round(effective_dbz, 1),
                "overall_risk": risk_lvl,
                "nearest_cell_distance_km": round(min_cell_dist, 1) if min_cell_dist < 200 else None,
            })

        return timeline

    @classmethod
    def generate_explainability(
        cls,
        metrics: AtmosphericMetrics,
        indices: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """
        Generates physical meteorological contributing factors.
        """
        factors = []

        # 1. Atmospheric Instability (CAPE / LI)
        cape = metrics.cape_j_kg
        li = metrics.lifted_index_c
        if cape > 2000 or li < -4:
            status = "Extreme"
            severity = "SEVERE"
            desc = f"Extreme buoyant energy (CAPE: {int(cape)} J/kg, LI: {li}°C) provides potent updraft acceleration."
        elif cape > 1000 or li < -1:
            status = "Moderate-High"
            severity = "HIGH"
            desc = f"Elevated instability (CAPE: {int(cape)} J/kg, LI: {li}°C) favorable for deep convective initiation."
        else:
            status = "Low-Stable"
            severity = "LOW"
            desc = f"Atmosphere has modest instability (CAPE: {int(cape)} J/kg, LI: {li}°C); convection remains suppressed."

        factors.append({
            "name": "Atmospheric Instability",
            "metric": f"{int(cape)} J/kg (CAPE) | {li}°C (LI)",
            "status": status,
            "severity": severity,
            "description": desc,
        })

        # 2. Moisture Availability (PWAT / Dewpoint)
        pwat = metrics.precipitable_water_mm
        dp = metrics.surface_dewpoint_c
        if pwat > 50:
            status = "Saturated Column"
            severity = "SEVERE"
            desc = f"Deep tropical moisture (PWAT: {pwat} mm, Td: {dp}°C) capable of fueling cloudburst-rate precipitation."
        elif pwat > 35:
            status = "Abundant"
            severity = "MODERATE"
            desc = f"Sufficient boundary layer moisture (PWAT: {pwat} mm) sustaining active storm downdrafts."
        else:
            status = "Dry / Modest"
            severity = "LOW"
            desc = f"Column moisture (PWAT: {pwat} mm) limits sustained severe precipitation efficiency."

        factors.append({
            "name": "Moisture Availability",
            "metric": f"{pwat} mm (PWAT) | {dp}°C (Td)",
            "status": status,
            "severity": severity,
            "description": desc,
        })

        # 3. Kinematic Wind Shear (0-6km Bulk Shear)
        shear = metrics.bulk_shear_0_6km_mps
        if shear > 20:
            status = "Strong Supercellular"
            severity = "SEVERE"
            desc = f"Deep-layer shear ({shear} m/s) organizes updrafts, prolongs cell longevity, and enables large hail formation."
        elif shear > 12:
            status = "Moderate Multicell"
            severity = "HIGH"
            desc = f"Sufficient shear ({shear} m/s) supports structured multicell clusters and organized squall lines."
        else:
            status = "Weak Pulse"
            severity = "LOW"
            desc = f"Low shear ({shear} m/s) indicates short-lived, unorganized single-cell pulse convection."

        factors.append({
            "name": "Vertical Wind Shear (0-6 km)",
            "metric": f"{shear} m/s ({round(shear * 3.6, 1)} km/h)",
            "status": status,
            "severity": severity,
            "description": desc,
        })

        # 4. Radar Reflectivity & Core Height
        dbz = metrics.radar_reflectivity_dbz
        top = metrics.echo_top_height_km
        if dbz > 50:
            status = "Severe Core / Hail Spike"
            severity = "SEVERE"
            desc = f"Intense reflectivity core ({dbz} dBZ, Echo Top: {top} km) confirms strong precipitation loading and hail presence."
        elif dbz > 35:
            status = "Moderate Convective"
            severity = "MODERATE"
            desc = f"Well-developed convective reflectivity ({dbz} dBZ, Echo Top: {top} km) producing localized downpours."
        else:
            status = "Weak / Light"
            severity = "LOW"
            desc = f"Reflectivity ({dbz} dBZ) is within stratiform or light shower thresholds."

        factors.append({
            "name": "Radar Core Reflectivity",
            "metric": f"{dbz} dBZ (Echo Top: {top} km)",
            "status": status,
            "severity": severity,
            "description": desc,
        })

        return factors
