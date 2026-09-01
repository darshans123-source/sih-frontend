import React, { useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Polygon,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Crosshair,
  Compass,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { StormCellDetail } from '../types/weather';

// Default center coordinates per SIH specification: 16.19387, 77.36985
const DEFAULT_LAT = 16.19387;
const DEFAULT_LON = 77.36985;

// Helper component to auto-recenter map when GPS coordinates change
const MapRecenter: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom() || 11, { animate: true });
  }, [center, map]);
  return null;
};

// Calculate convective impact probability based on radar metrics
const getCellProbability = (cell: StormCellDetail): number => {
  if (cell.max_dbz >= 60) return Math.min(98, Math.round(85 + (cell.max_dbz - 60) * 2.5));
  if (cell.max_dbz >= 50) return Math.min(84, Math.round(68 + (cell.max_dbz - 50) * 1.6));
  if (cell.max_dbz >= 40) return Math.min(67, Math.round(45 + (cell.max_dbz - 40) * 2.3));
  return Math.max(20, Math.round(cell.max_dbz * 0.9));
};

// Custom Leaflet GPS Marker using pulsating SVG HTML
const createGpsIcon = () => {
  return L.divIcon({
    className: 'custom-gps-marker',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <div class="absolute w-8 h-8 rounded-full bg-sky-400 opacity-75 animate-ping"></div>
        <div class="relative w-4 h-4 rounded-full bg-sky-500 border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Custom Storm Cell Marker with dBZ & Probability Label
const createCellIcon = (cell: StormCellDetail) => {
  const isSevere = cell.max_dbz >= 55;
  const isHigh = cell.max_dbz >= 45;
  const bgColor = isSevere ? '#ef4444' : isHigh ? '#f97316' : '#eab308';
  const probVal = getCellProbability(cell);

  return L.divIcon({
    className: 'custom-cell-marker',
    html: `
      <div class="relative flex flex-col items-center justify-center cursor-pointer group">
        <div class="w-7 h-7 rounded-full flex items-center justify-center shadow-lg border border-white/80 transition-transform group-hover:scale-125" style="background-color: ${bgColor};">
          <span class="text-[9px] font-mono font-bold text-white">${Math.round(cell.max_dbz)}</span>
        </div>
        <div class="mt-0.5 px-1.5 py-0.5 rounded bg-slate-900/95 text-[8px] font-mono font-bold text-slate-200 border border-slate-700 whitespace-nowrap shadow flex items-center gap-1">
          <span>${cell.cell_id}</span>
          <span class="text-amber-400">(${probVal}%)</span>
        </div>
      </div>
    `,
    iconSize: [36, 46],
    iconAnchor: [18, 23],
  });
};

// Generate realistic storm cell polygon coords around a centroid
const generateSyntheticPolygon = (
  centerLat: number,
  centerLon: number,
  radiusKm: number = 4
): [number, number][] => {
  const points: [number, number][] = [];
  const numVertices = 8;
  for (let i = 0; i < numVertices; i++) {
    const angle = (i / numVertices) * 2 * Math.PI;
    const radNoise = radiusKm * (0.8 + 0.4 * Math.sin(i * 2.5));
    const dLat = (radNoise * Math.cos(angle)) / 111.0;
    const dLon = (radNoise * Math.sin(angle)) / (111.0 * Math.cos((centerLat * Math.PI) / 180.0));
    points.push([centerLat + dLat, centerLon + dLon]);
  }
  return points;
};

export const WeatherMap: React.FC = () => {
  const {
    location,
    nowcast,
    selectedLeadTime,
    setSelectedLeadTime,
    setSelectedStormCell,
  } = useWeather();

  const userLat = location?.latitude || DEFAULT_LAT;
  const userLon = location?.longitude || DEFAULT_LON;
  const centerPos: [number, number] = [userLat, userLon];

  // Default 3 storm cells around center if nowcast cells are not yet loaded
  const displayCells = useMemo<StormCellDetail[]>(() => {
    if (nowcast?.storm_cells && nowcast.storm_cells.length > 0) {
      return nowcast.storm_cells;
    }

    // 3 storm cells oriented around the center (16.19387, 77.36985)
    return [
      {
        cell_id: 'CELL-SEV-ALPHA',
        centroid_lat: Number((userLat - 0.065).toFixed(5)),
        centroid_lon: Number((userLon - 0.055).toFixed(5)),
        max_dbz: 63.5,
        speed_kmh: 42.0,
        bearing_deg: 48.0,
        echo_top_km: 15.8,
        vil_kg_m2: 58.0,
        area_sq_km: 110.0,
        distance_to_user_km: 8.5,
        is_approaching: true,
        estimated_arrival_min: 12,
        polygons_by_time: {
          '0': generateSyntheticPolygon(userLat - 0.065, userLon - 0.055, 4.5),
          '15': generateSyntheticPolygon(userLat - 0.065 + 0.04, userLon - 0.055 + 0.045, 4.8),
          '30': generateSyntheticPolygon(userLat - 0.065 + 0.08, userLon - 0.055 + 0.09, 5.0),
          '45': generateSyntheticPolygon(userLat - 0.065 + 0.12, userLon - 0.055 + 0.135, 5.2),
          '60': generateSyntheticPolygon(userLat - 0.065 + 0.16, userLon - 0.055 + 0.18, 5.5),
        },
      },
      {
        cell_id: 'CELL-HAIL-BRAVO',
        centroid_lat: Number((userLat - 0.02).toFixed(5)),
        centroid_lon: Number((userLon - 0.14).toFixed(5)),
        max_dbz: 57.0,
        speed_kmh: 38.0,
        bearing_deg: 55.0,
        echo_top_km: 14.1,
        vil_kg_m2: 48.0,
        area_sq_km: 75.0,
        distance_to_user_km: 14.8,
        is_approaching: true,
        estimated_arrival_min: 24,
        polygons_by_time: {
          '0': generateSyntheticPolygon(userLat - 0.02, userLon - 0.14, 3.8),
          '15': generateSyntheticPolygon(userLat - 0.02 + 0.03, userLon - 0.14 + 0.045, 4.0),
          '30': generateSyntheticPolygon(userLat - 0.02 + 0.06, userLon - 0.14 + 0.09, 4.2),
          '45': generateSyntheticPolygon(userLat - 0.02 + 0.09, userLon - 0.14 + 0.135, 4.5),
          '60': generateSyntheticPolygon(userLat - 0.02 + 0.12, userLon - 0.14 + 0.18, 4.8),
        },
      },
      {
        cell_id: 'CELL-SQ-CHARLIE',
        centroid_lat: Number((userLat - 0.19).toFixed(5)),
        centroid_lon: Number((userLon - 0.02).toFixed(5)),
        max_dbz: 51.0,
        speed_kmh: 46.0,
        bearing_deg: 35.0,
        echo_top_km: 12.5,
        vil_kg_m2: 36.0,
        area_sq_km: 90.0,
        distance_to_user_km: 21.2,
        is_approaching: true,
        estimated_arrival_min: 28,
        polygons_by_time: {
          '0': generateSyntheticPolygon(userLat - 0.19, userLon - 0.02, 4.0),
          '15': generateSyntheticPolygon(userLat - 0.19 + 0.045, userLon - 0.02 + 0.03, 4.2),
          '30': generateSyntheticPolygon(userLat - 0.19 + 0.09, userLon - 0.02 + 0.06, 4.5),
          '45': generateSyntheticPolygon(userLat - 0.19 + 0.135, userLon - 0.02 + 0.09, 4.8),
          '60': generateSyntheticPolygon(userLat - 0.19 + 0.18, userLon - 0.02 + 0.12, 5.0),
        },
      },
    ];
  }, [nowcast?.storm_cells, userLat, userLon]);

  const leadTimeKey = String(selectedLeadTime);
  const timeSteps = [0, 15, 30, 45, 60];

  const getCellColor = (dbz: number) => {
    if (dbz >= 55) return { fill: '#ef4444', stroke: '#dc2626', opacity: 0.45 };
    if (dbz >= 45) return { fill: '#f97316', stroke: '#ea580c', opacity: 0.4 };
    if (dbz >= 35) return { fill: '#eab308', stroke: '#ca8a04', opacity: 0.35 };
    return { fill: '#22c55e', stroke: '#16a34a', opacity: 0.3 };
  };

  return (
    <div className="relative bg-radar-panel border border-radar-border rounded-xl shadow-xl overflow-hidden flex flex-col h-[520px] lg:h-[580px]">
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-radar-panel/90 border border-radar-border backdrop-blur-md shadow-lg text-xs">
          <Crosshair className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-mono font-bold text-slate-200">RADAR &bull; DOPPLER REFLECTIVITY</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-sky-300 border border-slate-700">
            {displayCells.length} ACTIVE CELLS
          </span>
        </div>
      </div>

      {/* Map Center Leaflet Canvas */}
      <div className="w-full h-full relative z-0">
        <MapContainer
          center={centerPos}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          attributionControl={true}
        >
          {/* Standard OpenStreetMap Tiles (No API key required) */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />

          <MapRecenter center={centerPos} />

          {/* User GPS Beacon Marker */}
          <Marker position={centerPos} icon={createGpsIcon()}>
            <Popup>
              <div className="p-1 text-xs">
                <p className="font-bold text-sky-400">GPS RADAR ORIGIN</p>
                <p className="font-mono text-slate-300">
                  {userLat.toFixed(5)}°N, {userLon.toFixed(5)}°E
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  15 km Severe Weather Surveillance Zone
                </p>
              </div>
            </Popup>
          </Marker>

          {/* 15km Proximity Warning Radius */}
          <Circle
            center={centerPos}
            radius={15000}
            pathOptions={{
              color: '#38bdf8',
              fillColor: '#38bdf8',
              fillOpacity: 0.04,
              weight: 1.5,
              dashArray: '5, 6',
            }}
          />

          {/* 3 Storm Cells: Polygons, Centroids, and Projected Movement Paths */}
          {displayCells.map((cell) => {
            const polygonCoords = cell.polygons_by_time?.[leadTimeKey] || [];
            const colors = getCellColor(cell.max_dbz);
            const probPct = getCellProbability(cell);

            // Compute projected centroid coordinates for selected lead time
            const hours = selectedLeadTime / 60.0;
            const distKm = cell.speed_kmh * hours;
            const bearingRad = (cell.bearing_deg * Math.PI) / 180.0;
            const latOffset = (distKm * Math.cos(bearingRad)) / 111.0;
            const lonOffset =
              (distKm * Math.sin(bearingRad)) /
              (111.0 * Math.cos((cell.centroid_lat * Math.PI) / 180.0));

            const projLat = cell.centroid_lat + latOffset;
            const projLon = cell.centroid_lon + lonOffset;
            const projPos: [number, number] = [projLat, projLon];

            // Projected movement path / motion vector line (1 hour horizon)
            const endLatOffset = (cell.speed_kmh * 1.0 * Math.cos(bearingRad)) / 111.0;
            const endLonOffset =
              (cell.speed_kmh * 1.0 * Math.sin(bearingRad)) /
              (111.0 * Math.cos((cell.centroid_lat * Math.PI) / 180.0));
            const vectorEnd: [number, number] = [
              cell.centroid_lat + endLatOffset,
              cell.centroid_lon + endLonOffset,
            ];

            return (
              <React.Fragment key={cell.cell_id}>
                {/* Storm Cell Polygon */}
                {polygonCoords.length > 0 && (
                  <Polygon
                    positions={polygonCoords as [number, number][]}
                    pathOptions={{
                      color: colors.stroke,
                      fillColor: colors.fill,
                      fillOpacity: colors.opacity,
                      weight: 2,
                    }}
                    eventHandlers={{
                      click: () => setSelectedStormCell(cell),
                    }}
                  />
                )}

                {/* Projected Movement Path (Dashed Arrow Trajectory) */}
                <Polyline
                  positions={[[cell.centroid_lat, cell.centroid_lon], vectorEnd]}
                  pathOptions={{
                    color: '#f8fafc',
                    weight: 2,
                    dashArray: '4, 4',
                    opacity: 0.8,
                  }}
                />

                {/* Storm Cell Marker with Probability Label */}
                <Marker
                  position={projPos}
                  icon={createCellIcon(cell)}
                  eventHandlers={{
                    click: () => setSelectedStormCell(cell),
                  }}
                >
                  <Popup>
                    <div className="p-1 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1">
                        <span className="font-bold text-white font-mono">{cell.cell_id}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300">
                          {cell.max_dbz} dBZ
                        </span>
                      </div>
                      <p className="text-slate-300">
                        Probability of Impact:{' '}
                        <strong className="text-amber-400 font-mono">
                          {probPct}%
                        </strong>
                      </p>
                      <p className="text-slate-300">
                        Velocity:{' '}
                        <span className="font-mono font-semibold text-slate-200">
                          {cell.speed_kmh} km/h @ {cell.bearing_deg}°
                        </span>
                      </p>
                      <p className="text-slate-300">
                        Distance to Sensor:{' '}
                        <span className="font-mono font-semibold text-slate-200">
                          {cell.distance_to_user_km} km
                        </span>
                      </p>
                      {cell.estimated_arrival_min && (
                        <p className="text-rose-400 font-bold">
                          ETA to Sector: ~{cell.estimated_arrival_min} min
                        </p>
                      )}
                      <button
                        onClick={() => setSelectedStormCell(cell)}
                        className="mt-1 w-full py-1 text-[10px] uppercase font-bold text-center bg-sky-600 hover:bg-sky-500 text-white rounded transition"
                      >
                        Inspect Cell Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      {/* Radar Reflectivity Scale Legend */}
      <div className="absolute bottom-16 left-3 z-[400] bg-radar-panel/90 border border-radar-border backdrop-blur-md rounded-lg p-2 shadow-lg text-[10px] pointer-events-auto">
        <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
          Reflectivity (dBZ)
        </span>
        <div className="flex items-center gap-1">
          <span className="w-4 h-2.5 rounded-sm bg-emerald-500" title="20-30 dBZ: Light Rain" />
          <span className="w-4 h-2.5 rounded-sm bg-yellow-500" title="35-45 dBZ: Moderate Convection" />
          <span className="w-4 h-2.5 rounded-sm bg-orange-500" title="45-55 dBZ: Heavy Storm" />
          <span className="w-4 h-2.5 rounded-sm bg-rose-600" title="55-65 dBZ: Severe Hail / Deluge" />
          <span className="w-4 h-2.5 rounded-sm bg-purple-600" title=">65 dBZ: Extreme Cloudburst Core" />
        </div>
        <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-0.5">
          <span>20</span>
          <span>35</span>
          <span>50</span>
          <span>65+</span>
        </div>
      </div>

      {/* Time Horizon Scrubber Control Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-[400] flex items-center justify-between gap-2 p-2 rounded-xl bg-radar-panel/95 border border-radar-border backdrop-blur-md shadow-2xl pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 hidden sm:inline">
            Nowcast Advection
          </span>
        </div>

        {/* Lead time buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {timeSteps.map((mins) => {
            const isSelected = selectedLeadTime === mins;
            const label = mins === 0 ? 'NOW' : `+${mins}m`;

            return (
              <button
                key={mins}
                onClick={() => setSelectedLeadTime(mins)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 scale-105'
                    : 'bg-radar-surface hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-radar-border'
                }`}
              >
                {mins === 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-[11px] font-mono text-slate-400 hidden md:block">
          Lead Time: <span className="text-sky-300 font-bold">+{selectedLeadTime} Min</span>
        </div>
      </div>
    </div>
  );
};
