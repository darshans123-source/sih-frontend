export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
export type TrendDirection = 'DECREASING' | 'STABLE' | 'INCREASING' | 'RAPIDLY_INTENSIFYING';
export type AlertPriority = 'WATCH' | 'WARNING' | 'SEVERE';
export type ProviderMode = 'demo' | 'live';
export type DemoScenario = 'NORMAL' | 'DEVELOPING_STORM' | 'SEVERE_CONVECTIVE_EVENT';

export interface HazardDetail {
  risk_level: RiskLevel;
  probability: number;
  confidence: number;
  trend: TrendDirection;
}

export interface HazardsSummary {
  thunderstorm: HazardDetail;
  hail: HazardDetail;
  cloudburst: HazardDetail;
}

export interface AtmosphericMetrics {
  cape_j_kg: number;
  cin_j_kg: number;
  lifted_index_c: number;
  k_index: number;
  precipitable_water_mm: number;
  bulk_shear_0_6km_mps: number;
  freezing_level_m: number;
  surface_temp_c: number;
  surface_dewpoint_c: number;
  surface_pressure_hpa: number;
  radar_reflectivity_dbz: number;
  echo_top_height_km: number;
  vertically_integrated_liquid_kg_m2: number;
}

export interface TimelineStep {
  time_offset_min: number;
  label: string;
  thunderstorm_probability: number;
  hail_probability: number;
  cloudburst_probability: number;
  rainfall_intensity_mm_h: number;
  radar_reflectivity_dbz: number;
  overall_risk: RiskLevel;
  nearest_cell_distance_km: number | null;
}

export interface ExplainabilityFactor {
  name: string;
  metric: string;
  status: string;
  severity: RiskLevel;
  description: string;
}

export interface StormCellDetail {
  cell_id: string;
  centroid_lat: number;
  centroid_lon: number;
  max_dbz: number;
  speed_kmh: number;
  bearing_deg: number;
  echo_top_km: number;
  vil_kg_m2: number;
  area_sq_km: number;
  distance_to_user_km: number;
  is_approaching: boolean;
  estimated_arrival_min: number | null;
  polygons_by_time: {
    [key: string]: [number, number][];
  };
}

export interface AlertItem {
  alert_id: string;
  hazard_type: string;
  priority: AlertPriority;
  title: string;
  message: string;
  issued_at: string;
  expires_at: string;
  acknowledged?: boolean;
  affected_radius_km: number;
}

export interface GpsLocation {
  latitude: number;
  longitude: number;
  accuracy_m: number | null;
  altitude_m: number | null;
  timestamp: number;
}

export interface NowcastResponse {
  status: string;
  provider_mode: ProviderMode;
  scenario: string | null;
  generated_at: string;
  coordinates: {
    latitude: number;
    longitude: number;
    accuracy_m: number;
  };
  hazards: HazardsSummary;
  atmospheric_metrics: AtmosphericMetrics;
  timeline: TimelineStep[];
  explainability: ExplainabilityFactor[];
  storm_cells: StormCellDetail[];
  active_alerts: AlertItem[];
}

export interface ScenarioInfo {
  id: DemoScenario;
  name: string;
  description: string;
  expected_severity: RiskLevel;
  cell_count: number;
}
