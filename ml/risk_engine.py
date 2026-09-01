"""
Unified Convective Risk Engine (Baseline & ML Interface).
Implements the multi-hazard nowcasting calculation pipeline for SIH26084.
"""

from typing import Dict, Any, List, Optional
from .features.atmospheric_features import AtmosphericMetrics, compute_convective_indices
from .models.severe_classifier import SevereConvectiveClassifier, RiskLevel
from .preprocessing.radar_sounding import StormCellCluster, compute_distance_km, compute_bearing
from .inference.nowcast_predictor import NowcastPredictor

class ConvectiveRiskEngine:
    """
    Operational nowcasting engine calculating Thunderstorm, Hail, and Cloudburst
    convective risks, trajectories, and explainability metrics.
    """

    def __init__(self):
        self.version = "2.4.0-sih-prod"

    def evaluate_location(
        self,
        lat: float,
        lon: float,
        metrics: AtmosphericMetrics,
        storm_cells: List[StormCellCluster],
        previous_scores: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        """
        Executes end-to-end convective nowcast evaluation for the given GPS coordinate.
        """
        # 1. Compute physical thermodynamic & kinematic indices
        indices = compute_convective_indices(metrics)
        prev = previous_scores or {"tstorm": 10.0, "hail": 0.0, "cloudburst": 0.0}

        # 2. Evaluate hazard risk levels & trends
        tstorm_eval = SevereConvectiveClassifier.evaluate_hazard(
            score=indices["thunderstorm_score"],
            probability=indices["tstorm_probability"],
            previous_score=prev.get("tstorm", 10.0),
        )

        hail_eval = SevereConvectiveClassifier.evaluate_hazard(
            score=indices["hail_score"],
            probability=indices["hail_probability"],
            previous_score=prev.get("hail", 0.0),
        )

        cloudburst_eval = SevereConvectiveClassifier.evaluate_hazard(
            score=indices["cloudburst_score"],
            probability=indices["cloudburst_probability"],
            previous_score=prev.get("cloudburst", 0.0),
        )

        # 3. Generate 0-60min stepped nowcast timeline
        timeline = NowcastPredictor.generate_timeline(
            metrics=metrics,
            user_lat=lat,
            user_lon=lon,
            storm_cells=storm_cells,
        )

        # 4. Generate physics-based explainability factors
        explainability = NowcastPredictor.generate_explainability(
            metrics=metrics,
            indices=indices,
        )

        # 5. Determine storm cells metadata with user proximity & arrival ETA
        cells_data = []
        for cell in storm_cells:
            dist_km = compute_distance_km(lat, lon, cell.centroid_lat, cell.centroid_lon)
            bearing_from_cell = compute_bearing(cell.centroid_lat, cell.centroid_lon, lat, lon)
            
            # Check if cell is moving towards user
            angle_diff = abs((cell.bearing_deg - bearing_from_cell + 180) % 360 - 180)
            is_approaching = angle_diff < 45.0 and dist_km > 0.5
            
            eta_minutes = None
            if is_approaching and cell.speed_kmh > 1.0:
                eta_minutes = round((dist_km / cell.speed_kmh) * 60.0)

            cells_data.append({
                "cell_id": cell.cell_id,
                "centroid_lat": cell.centroid_lat,
                "centroid_lon": cell.centroid_lon,
                "max_dbz": cell.max_dbz,
                "speed_kmh": cell.speed_kmh,
                "bearing_deg": cell.bearing_deg,
                "echo_top_km": cell.echo_top_km,
                "vil_kg_m2": cell.vil_kg_m2,
                "area_sq_km": cell.area_sq_km,
                "distance_to_user_km": round(dist_km, 1),
                "is_approaching": is_approaching,
                "estimated_arrival_min": eta_minutes,
                "polygons_by_time": {
                    "0": cell.generate_polygon(0),
                    "15": cell.generate_polygon(15),
                    "30": cell.generate_polygon(30),
                    "45": cell.generate_polygon(45),
                    "60": cell.generate_polygon(60),
                }
            })

        return {
            "engine_version": self.version,
            "hazards": {
                "thunderstorm": tstorm_eval,
                "hail": hail_eval,
                "cloudburst": cloudburst_eval,
            },
            "atmospheric_metrics": metrics.model_dump(),
            "timeline": timeline,
            "explainability": explainability,
            "storm_cells": cells_data,
        }
