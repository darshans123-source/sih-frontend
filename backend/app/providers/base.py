"""
Abstract Base Weather Provider Interface.
Allows plugging in real meteorological feeds (IMD, Open-Meteo, Radar grids, Doppler feeds)
or deterministic simulation engines without modifying application core logic.
"""

from abc import ABC, abstractmethod
from typing import List, Tuple
import sys
import os

# Add root directory to sys.path so ml imports work cleanly
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))
from ml.features.atmospheric_features import AtmosphericMetrics
from ml.preprocessing.radar_sounding import StormCellCluster

class BaseWeatherProvider(ABC):
    """
    Interface for weather and radar data sources.
    """

    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @property
    @abstractmethod
    def is_live_feed(self) -> bool:
        pass

    @abstractmethod
    async def fetch_atmospheric_metrics(self, lat: float, lon: float) -> AtmosphericMetrics:
        """
        Retrieves upper-air and surface thermodynamic parameters for the given coordinates.
        """
        pass

    @abstractmethod
    async def fetch_storm_cells(self, lat: float, lon: float) -> List[StormCellCluster]:
        """
        Retrieves tracked radar storm cell centroids, vectors, and reflectivity envelopes.
        """
        pass
