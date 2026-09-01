"""
Radar and Sounding Preprocessing for Convective Cell Identification and Tracking.
Implements centroid-based SCIT (Storm Cell Identification and Tracking) representations.
"""

from typing import List, Dict, Any, Tuple
import math

class StormCellCluster:
    def __init__(
        self,
        cell_id: str,
        centroid_lat: float,
        centroid_lon: float,
        max_dbz: float,
        speed_kmh: float,
        bearing_deg: float,
        echo_top_km: float,
        vil_kg_m2: float,
        area_sq_km: float,
    ):
        self.cell_id = cell_id
        self.centroid_lat = centroid_lat
        self.centroid_lon = centroid_lon
        self.max_dbz = max_dbz
        self.speed_kmh = speed_kmh
        self.bearing_deg = bearing_deg
        self.echo_top_km = echo_top_km
        self.vil_kg_m2 = vil_kg_m2
        self.area_sq_km = area_sq_km

    def project_position(self, minutes: int) -> Tuple[float, float]:
        """
        Projects cell centroid position forward in time using kinematic advection.
        bearing_deg is meteorological direction of motion (0=N, 90=E, 180=S, 270=W).
        """
        hours = minutes / 60.0
        distance_km = self.speed_kmh * hours
        earth_radius_km = 6371.0

        lat_rad = math.radians(self.centroid_lat)
        lon_rad = math.radians(self.centroid_lon)
        bearing_rad = math.radians(self.bearing_deg)

        new_lat_rad = math.asin(
            math.sin(lat_rad) * math.cos(distance_km / earth_radius_km) +
            math.cos(lat_rad) * math.sin(distance_km / earth_radius_km) * math.cos(bearing_rad)
        )

        new_lon_rad = lon_rad + math.atan2(
            math.sin(bearing_rad) * math.sin(distance_km / earth_radius_km) * math.cos(lat_rad),
            math.cos(distance_km / earth_radius_km) - math.sin(lat_rad) * math.sin(new_lat_rad)
        )

        return (math.degrees(new_lat_rad), math.degrees(new_lon_rad))

    def generate_polygon(self, minutes: int = 0) -> List[List[float]]:
        """
        Generates a 6-point elliptical polygon representing the radar >35 dBZ envelope
        projected at specified lead time.
        """
        c_lat, c_lon = self.project_position(minutes)
        # Radius in degrees approx (1 deg ~ 111 km)
        radius_km = math.sqrt(self.area_sq_km / math.pi)
        # Add slight elongation in direction of shear
        lat_radius = radius_km / 111.0
        lon_radius = radius_km / (111.0 * math.cos(math.radians(c_lat)))

        points = []
        for i in range(8):
            angle = i * (2 * math.pi / 8)
            # Add distortion for realistic convective cell contours
            wobble = 1.0 + 0.15 * math.sin(angle * 3)
            p_lat = c_lat + (lat_radius * math.cos(angle) * wobble)
            p_lon = c_lon + (lon_radius * math.sin(angle) * wobble)
            points.append([round(p_lat, 5), round(p_lon, 5)])
        
        # Close polygon
        points.append(points[0])
        return points

def compute_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine formula distance between two coordinates in kilometers."""
    R = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2.0) ** 2 +
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def compute_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Returns compass bearing from point 1 to point 2 in degrees (0-360)."""
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_lambda = math.radians(lon2 - lon1)

    y = math.sin(delta_lambda) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(delta_lambda)
    theta = math.atan2(y, x)
    return (math.degrees(theta) + 360.0) % 360.0
