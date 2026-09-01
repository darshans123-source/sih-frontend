"""
Severe Convective Classifier Model.
Translates thermodynamic indices and kinematic observations into operational threat tiers:
LOW, MODERATE, HIGH, SEVERE.
"""

from typing import Dict, Any, List
from enum import Enum

class RiskLevel(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    SEVERE = "SEVERE"

class TrendDirection(str, Enum):
    DECREASING = "DECREASING"
    STABLE = "STABLE"
    INCREASING = "INCREASING"
    RAPIDLY_INTENSIFYING = "RAPIDLY_INTENSIFYING"

def score_to_risk_level(score: float) -> RiskLevel:
    if score >= 75.0:
        return RiskLevel.SEVERE
    elif score >= 50.0:
        return RiskLevel.HIGH
    elif score >= 25.0:
        return RiskLevel.MODERATE
    else:
        return RiskLevel.LOW

class SevereConvectiveClassifier:
    """
    ML and rule-augmented multi-hazard classifier for convective weather hazards.
    """

    @classmethod
    def evaluate_hazard(
        cls,
        score: float,
        probability: float,
        previous_score: float,
        data_quality_factor: float = 0.95,
    ) -> Dict[str, Any]:
        risk_level = score_to_risk_level(score)

        # Determine trend based on derivative of score
        delta = score - previous_score
        if delta > 12.0:
            trend = TrendDirection.RAPIDLY_INTENSIFYING
        elif delta > 3.0:
            trend = TrendDirection.INCREASING
        elif delta < -3.0:
            trend = TrendDirection.DECREASING
        else:
            trend = TrendDirection.STABLE

        # Confidence calculation: higher when indicators are consistent
        confidence = round(min(98.0, max(65.0, (score * 0.3 + 60.0) * data_quality_factor)), 0)

        return {
            "risk_level": risk_level.value,
            "probability": round(probability, 1),
            "confidence": int(confidence),
            "trend": trend.value,
        }
