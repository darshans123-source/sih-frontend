"""
Operational Alert Engine.
Monitors convective thresholds for Thunderstorm, Hail, and Cloudburst events,
issuing categorized alerts (WATCH, WARNING, SEVERE) with deduplication and state tracking.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import hashlib

from ..models.schemas import AlertItem, HazardsSummary, StormCellDetail

class ConvectiveAlertEngine:
    """
    Evaluates real-time hazard matrices and generates structured alerts.
    """

    def __init__(self):
        self._alert_history: Dict[str, AlertItem] = {}

    def evaluate_alerts(
        self,
        lat: float,
        lon: float,
        hazards: Dict[str, Any],
        storm_cells: List[Dict[str, Any]],
        timeline: List[Dict[str, Any]],
    ) -> List[AlertItem]:
        active_alerts: List[AlertItem] = []
        now = datetime.utcnow()
        expires = now + timedelta(minutes=45)

        tstorm = hazards.get("thunderstorm", {})
        hail = hazards.get("hail", {})
        cloudburst = hazards.get("cloudburst", {})

        # 1. Cloudburst Alert Checks (Flash Deluge Hazard)
        cb_risk = cloudburst.get("risk_level", "LOW")
        cb_prob = cloudburst.get("probability", 0.0)
        
        if cb_risk == "SEVERE" or cb_prob >= 75.0:
            uid = self._generate_alert_id("CLOUDBURST", "SEVERE", lat, lon)
            alert = AlertItem(
                alert_id=uid,
                hazard_type="CLOUDBURST",
                priority="SEVERE",
                title="EMERGENCY: Imminent Cloudburst & Torrential Deluge",
                message="Extremely intense convective precipitation core (>75 mm/h rate) detected moving over your GPS sector. High risk of localized flash flooding, waterlogging, and mountain washouts.",
                issued_at=now.isoformat() + "Z",
                expires_at=expires.isoformat() + "Z",
                affected_radius_km=15.0,
            )
            active_alerts.append(alert)
        elif cb_risk == "HIGH" or cb_prob >= 50.0:
            uid = self._generate_alert_id("CLOUDBURST", "WARNING", lat, lon)
            alert = AlertItem(
                alert_id=uid,
                hazard_type="CLOUDBURST",
                priority="WARNING",
                title="WARNING: High Cloudburst Potential",
                message="Deep saturated tropospheric column with slow-moving convective cells. Prepare for sudden torrential downpours exceeding 40 mm/h within 30 minutes.",
                issued_at=now.isoformat() + "Z",
                expires_at=expires.isoformat() + "Z",
                affected_radius_km=20.0,
            )
            active_alerts.append(alert)

        # 2. Hail Alert Checks
        hail_risk = hail.get("risk_level", "LOW")
        hail_prob = hail.get("probability", 0.0)
        
        if hail_risk == "SEVERE" or hail_prob >= 70.0:
            uid = self._generate_alert_id("HAIL", "SEVERE", lat, lon)
            alert = AlertItem(
                alert_id=uid,
                hazard_type="HAIL",
                priority="SEVERE",
                title="SEVERE WARNING: Large Damaging Hail Core Approaching",
                message="Intense radar core with elevated VIL and high freezing-level instability. Large hail (>2.5 cm diameter) and damaging downburst winds expected.",
                issued_at=now.isoformat() + "Z",
                expires_at=expires.isoformat() + "Z",
                affected_radius_km=18.0,
            )
            active_alerts.append(alert)
        elif hail_risk == "HIGH" or hail_prob >= 45.0:
            uid = self._generate_alert_id("HAIL", "WARNING", lat, lon)
            alert = AlertItem(
                alert_id=uid,
                hazard_type="HAIL",
                priority="WARNING",
                title="HAIL WARNING: Destructive Hail Threat",
                message="Strong updrafts supporting hail aloft with high probability of surface impact within 15-30 minutes.",
                issued_at=now.isoformat() + "Z",
                expires_at=expires.isoformat() + "Z",
                affected_radius_km=25.0,
            )
            active_alerts.append(alert)

        # 3. Thunderstorm Severe Alert Checks
        ts_risk = tstorm.get("risk_level", "LOW")
        ts_prob = tstorm.get("probability", 0.0)
        
        if ts_risk in ["SEVERE", "HIGH"] and not any(a.hazard_type in ["CLOUDBURST", "HAIL"] for a in active_alerts):
            uid = self._generate_alert_id("THUNDERSTORM", "WARNING", lat, lon)
            alert = AlertItem(
                alert_id=uid,
                hazard_type="THUNDERSTORM",
                priority="WARNING",
                title="THUNDERSTORM WARNING: Severe Convective Activity",
                message="Frequent cloud-to-ground lightning, localized microburst gusts (>60 km/h), and heavy convective showers developing.",
                issued_at=now.isoformat() + "Z",
                expires_at=expires.isoformat() + "Z",
                affected_radius_km=30.0,
            )
            active_alerts.append(alert)
        elif ts_risk == "MODERATE" and not active_alerts:
            uid = self._generate_alert_id("THUNDERSTORM", "WATCH", lat, lon)
            alert = AlertItem(
                alert_id=uid,
                hazard_type="THUNDERSTORM",
                priority="WATCH",
                title="CONVECTIVE WATCH: Thunderstorm Formation Possible",
                message="Atmospheric instability and shear parameters favor thunderstorm initiation in your broader sector over the next 1-2 hours.",
                issued_at=now.isoformat() + "Z",
                expires_at=expires.isoformat() + "Z",
                affected_radius_km=40.0,
            )
            active_alerts.append(alert)

        # Update cache
        for a in active_alerts:
            self._alert_history[a.alert_id] = a

        return active_alerts

    def _generate_alert_id(self, hazard: str, priority: str, lat: float, lon: float) -> str:
        # 10-minute bucket for stable deduplication
        time_bucket = datetime.utcnow().strftime("%Y%m%d%H%M")[:-1]
        lat_grid = round(lat, 2)
        lon_grid = round(lon, 2)
        raw = f"{hazard}_{priority}_{lat_grid}_{lon_grid}_{time_bucket}"
        return "ALT-" + hashlib.md5(raw.encode()).hexdigest()[:10].upper()
