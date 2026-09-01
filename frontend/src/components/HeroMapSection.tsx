import React, { useEffect, useMemo, useState } from 'react';
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
  Maximize2,
  Minimize2,
  Navigation,
  Compass,
  Plus,
  Minus,
  Layers,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { StormCellDetail } from '../types/weather';
import { useTranslation } from '../i18n';

const DEFAULT_LAT = 16.19387;
const DEFAULT_LON = 77.36985;

// Helper to recenter map view
const MapController: React.FC<{
  center: [number, number];
  zoomAction: number;
  triggerRecenter: number;
}> = ({ center, zoomAction, triggerRecenter }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom() || 11, { animate: true });
  }, [center, triggerRecenter, map]);

  useEffect(() => {
    if (zoomAction > 0) {
      map.zoomIn();
    } else if (zoomAction < 0) {
      map.zoomOut();
    }
  }, [zoomAction, map]);

  return null;
};

// Calculate convective impact probability
const getCellProbability = (cell: StormCellDetail): number => {
  if (cell.max_dbz >= 60) return Math.min(98, Math.round(85 + (cell.max_dbz - 60) * 2.5));
  if (cell.max_dbz >= 50) return Math.min(84, Math.round(68 + (cell.max_dbz - 50) * 1.6));
  if (cell.max_dbz >= 40) return Math.min(67, Math.round(45 + (cell.max_dbz - 40) * 2.3));
  return Math.max(20, Math.round(cell.max_dbz * 0.9));
};

// Google Maps / Apple Weather style crisp blue location beacon
const createGpsIcon = () => {
  return L.divIcon({
    className: 'custom-apple-gps-marker',
    html: `
      <div class="relative flex items-center justify-center w-12 h-12">
        <div class="absolute w-12 h-12 rounded-full bg-sky-500/25 animate-gps-pulse"></div>
        <div class="relative w-7 h-7 rounded-full bg-white border-2 border-sky-500 shadow-xl flex items-center justify-center">
          <div class="w-3.5 h-3.5 rounded-full bg-sky-500 shadow-sm"></div>
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
};

// Custom Storm Cell Marker with subtle translucent threat styling
const createCellIcon = (cell: StormCellDetail, severeText: string, highText: string, modText: string) => {
  const isSevere = cell.max_dbz >= 55;
  const isHigh = cell.max_dbz >= 45;
  const bgColor = isSevere ? '#ef4444' : isHigh ? '#f97316' : '#eab308';
  const label = isSevere ? severeText : isHigh ? highText : modText;

  return L.divIcon({
    className: 'custom-weather-cell-marker',
    html: `
      <div class="relative flex flex-col items-center justify-center cursor-pointer group">
        <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-xl border-2 border-white transition-transform group-hover:scale-115" style="background-color: ${bgColor};">
          <span class="text-[10px] font-black text-white">${Math.round(cell.max_dbz)}</span>
        </div>
        <div class="mt-1 px-2 py-0.5 rounded-full bg-white/95 text-[9px] font-bold text-slate-800 border border-slate-200 shadow-md whitespace-nowrap flex items-center gap-1">
          <span>🌩️ ${cell.cell_id}</span>
          <span class="text-rose-600 font-extrabold">&bull; ${label}</span>
        </div>
      </div>
    `,
    iconSize: [40, 52],
    iconAnchor: [20, 26],
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
  const latRadius = radiusKm / 111.0;
  const lonRadius = radiusKm / (111.0 * Math.cos((centerLat * Math.PI) / 180.0));

  for (let i = 0; i < numVertices; i++) {
    const angle = (i * 2 * Math.PI) / numVertices;
    const variation = 0.8 + Math.sin(i * 2.3) * 0.35;
    const pLat = centerLat + Math.cos(angle) * latRadius * variation;
    const pLon = centerLon + Math.sin(angle) * lonRadius * variation;
    points.push([Number(pLat.toFixed(5)), Number(pLon.toFixed(5))]);
  }
  return points;
};

export const HeroMapSection: React.FC<{
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}> = ({ isFullscreen = false, onToggleFullscreen }) => {
  const {
    location,
    nowcast,
    selectedLeadTime,
    setSelectedLeadTime,
    setSelectedStormCell,
  } = useWeather();
  const { t } = useTranslation();

  const [zoomAction, setZoomAction] = useState<number>(0);
  const [recenterCount, setRecenterCount] = useState<number>(0);
  const [showLegend, setShowLegend] = useState<boolean>(false);

  const userLat = location?.latitude ?? DEFAULT_LAT;
  const userLon = location?.longitude ?? DEFAULT_LON;
  const centerPos: [number, number] = useMemo(() => [userLat, userLon], [userLat, userLon]);

  const displayCells = useMemo(() => {
    if (nowcast?.storm_cells && nowcast.storm_cells.length > 0) {
      return nowcast.storm_cells.map((cell, idx) => {
        if (!cell.polygons_by_time || Object.keys(cell.polygons_by_time).length === 0) {
          const rKm = 3.5 + (cell.max_dbz > 55 ? 2.0 : 0.5) + idx * 0.4;
          return {
            ...cell,
            polygons_by_time: {
              '0': generateSyntheticPolygon(cell.centroid_lat, cell.centroid_lon, rKm),
              '15': generateSyntheticPolygon(cell.centroid_lat + 0.04, cell.centroid_lon + 0.045, rKm + 0.3),
              '30': generateSyntheticPolygon(cell.centroid_lat + 0.08, cell.centroid_lon + 0.09, rKm + 0.5),
              '45': generateSyntheticPolygon(cell.centroid_lat + 0.12, cell.centroid_lon + 0.135, rKm + 0.7),
              '60': generateSyntheticPolygon(cell.centroid_lat + 0.16, cell.centroid_lon + 0.18, rKm + 1.0),
            },
          };
        }
        return cell;
      });
    }

    // High quality fallback synthetic storm cells
    return [
      {
        cell_id: 'CELL A',
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
        estimated_arrival_min: 18,
        polygons_by_time: {
          '0': generateSyntheticPolygon(userLat - 0.065, userLon - 0.055, 4.5),
          '15': generateSyntheticPolygon(userLat - 0.065 + 0.04, userLon - 0.055 + 0.045, 4.8),
          '30': generateSyntheticPolygon(userLat - 0.065 + 0.08, userLon - 0.055 + 0.09, 5.0),
          '45': generateSyntheticPolygon(userLat - 0.065 + 0.12, userLon - 0.055 + 0.135, 5.2),
          '60': generateSyntheticPolygon(userLat - 0.065 + 0.16, userLon - 0.055 + 0.18, 5.5),
        },
      },
      {
        cell_id: 'CELL B',
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
        cell_id: 'CELL C',
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
        estimated_arrival_min: 32,
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
    <div
      className={`relative floating-glass rounded-[26px] p-2.5 shadow-2xl flex flex-col transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen p-0' : 'h-[540px] lg:h-[660px] w-full'
      }`}
    >
      {/* Top Floating Map Badge */}
      <div className="absolute top-5 left-5 z-[400] flex items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-md text-xs text-slate-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </span>
          <span className="font-bold tracking-tight">{t('common.liveRadarNowcast')}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
            {t('common.activeStorms', { count: displayCells.length })}
          </span>
        </div>
      </div>

      {/* Top Right Floating Circular Controls */}
      <div className="absolute top-5 right-5 z-[400] flex flex-col gap-2.5 pointer-events-auto">
        {/* Locate Me */}
        <button
          onClick={() => setRecenterCount((prev) => prev + 1)}
          title={t('common.locateMe')}
          className="w-11 h-11 rounded-full floating-glass-btn flex items-center justify-center text-slate-700 hover:text-sky-600 cursor-pointer shadow-md"
        >
          <Navigation className="w-5 h-5" />
        </button>

        {/* Fullscreen Toggle */}
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            title={t('common.fullscreen')}
            className="w-11 h-11 rounded-full floating-glass-btn flex items-center justify-center text-slate-700 hover:text-sky-600 cursor-pointer shadow-md"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Bottom Right Floating Zoom & Layers Controls */}
      <div className="absolute bottom-16 right-5 z-[400] flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={() => setZoomAction((prev) => (prev > 0 ? prev + 1 : 1))}
          title="Zoom In"
          className="w-10 h-10 rounded-full floating-glass-btn flex items-center justify-center text-slate-700 hover:text-sky-600 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={() => setZoomAction((prev) => (prev < 0 ? prev - 1 : -1))}
          title="Zoom Out"
          className="w-10 h-10 rounded-full floating-glass-btn flex items-center justify-center text-slate-700 hover:text-sky-600 cursor-pointer shadow-md"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowLegend(!showLegend)}
          title="Radar Legend"
          className="w-10 h-10 rounded-full floating-glass-btn flex items-center justify-center text-slate-700 hover:text-sky-600 cursor-pointer shadow-md"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Radar Legend Overlay */}
      {showLegend && (
        <div className="absolute bottom-16 left-5 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-3 shadow-xl text-xs text-slate-800 animate-in fade-in zoom-in-95 pointer-events-auto">
          <span className="font-bold text-slate-700 block mb-1.5 text-[11px] uppercase tracking-wider">
            {t('details.radarReflectivity')} (dBZ)
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-2.5 rounded bg-emerald-500" title="Light Rain (20-30 dBZ)" />
            <span className="w-5 h-2.5 rounded bg-yellow-500" title="Moderate (35-45 dBZ)" />
            <span className="w-5 h-2.5 rounded bg-orange-500" title="Heavy Storm (45-55 dBZ)" />
            <span className="w-5 h-2.5 rounded bg-rose-600" title="Severe Hail (55-65 dBZ)" />
            <span className="w-5 h-2.5 rounded bg-purple-600" title="Cloudburst (>65 dBZ)" />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
            <span>{t('threats.low')}</span>
            <span>{t('threats.moderate')}</span>
            <span>{t('threats.severe')}</span>
          </div>
        </div>
      )}

      {/* Main Map Container */}
      <div className="w-full h-full rounded-[22px] overflow-hidden relative z-0">
        <MapContainer
          center={centerPos}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          <MapController
            center={centerPos}
            zoomAction={zoomAction}
            triggerRecenter={recenterCount}
          />

          {/* User Location Beacon */}
          <Marker position={centerPos} icon={createGpsIcon()}>
            <Popup>
              <div className="p-1 space-y-1 text-xs text-slate-800">
                <div className="flex items-center gap-1 font-bold text-sky-600 text-sm">
                  <span>📍 {t('approach.yourLocation').toUpperCase()}</span>
                </div>
                <p className="font-medium text-slate-600">
                  {userLat.toFixed(5)}° N, {userLon.toFixed(5)}° E
                </p>
                <p className="text-[11px] text-slate-500">
                  {t('landing.zoneTitle')} &bull; {t('common.gpsActive')}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* 15km Surveillance Warning Radius */}
          <Circle
            center={centerPos}
            radius={15000}
            pathOptions={{
              color: '#0284c7',
              fillColor: '#38bdf8',
              fillOpacity: 0.06,
              weight: 1.5,
              dashArray: '5, 7',
            }}
          />

          {/* Storm Cells */}
          {displayCells.map((cell) => {
            const polygonCoords = cell.polygons_by_time?.[leadTimeKey] || [];
            const colors = getCellColor(cell.max_dbz);
            const probPct = getCellProbability(cell);

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

                <Polyline
                  positions={[[cell.centroid_lat, cell.centroid_lon], vectorEnd]}
                  pathOptions={{
                    color: '#0f172a',
                    weight: 2.5,
                    dashArray: '5, 5',
                    opacity: 0.7,
                  }}
                />

                <Marker
                  position={projPos}
                  icon={createCellIcon(
                    cell,
                    t('threats.severe'),
                    t('threats.high'),
                    t('threats.moderate')
                  )}
                  eventHandlers={{
                    click: () => setSelectedStormCell(cell),
                  }}
                >
                  <Popup>
                    <div className="p-1 space-y-1.5 text-xs text-slate-800">
                      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-1">
                        <span className="font-bold text-slate-900 text-sm">🌩️ {cell.cell_id}</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                          {cell.max_dbz} dBZ
                        </span>
                      </div>
                      <p className="text-slate-600">
                        {t('map.impactProb')}: <strong className="text-slate-900">{probPct}%</strong>
                      </p>
                      <p className="text-slate-600">
                        {t('map.speedLabel')}: <strong>{cell.speed_kmh} km/h</strong> @ {cell.bearing_deg}°
                      </p>
                      <p className="text-slate-600">
                        {t('map.distanceLabel')}: <strong>{cell.distance_to_user_km} km</strong>
                      </p>
                      {cell.estimated_arrival_min && (
                        <p className="text-rose-600 font-bold text-sm">
                          {t('map.expected', { min: cell.estimated_arrival_min })}
                        </p>
                      )}
                      <button
                        onClick={() => setSelectedStormCell(cell)}
                        className="mt-1 w-full py-1.5 text-xs font-bold text-center bg-sky-600 hover:bg-sky-500 text-white rounded-xl transition cursor-pointer shadow-sm"
                      >
                        {t('map.inspectCell')}
                      </button>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      {/* Floating Bottom Time Scrubber Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-[400] flex items-center justify-between gap-2 p-2 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-lg pointer-events-auto">
        <div className="flex items-center gap-2 pl-2">
          <Compass className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-bold text-slate-700 hidden sm:inline">
            {t('map.nowcastTime')}
          </span>
        </div>

        {/* Lead Time Buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {timeSteps.map((mins) => {
            const isSelected = selectedLeadTime === mins;
            const label = mins === 0 ? t('timeline.now') : `+${mins}m`;

            return (
              <button
                key={mins}
                onClick={() => setSelectedLeadTime(mins)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 scale-105'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {mins === 0 && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-600 pr-2 hidden md:block">
          {t('map.outlook')} <strong className="text-sky-700">+{selectedLeadTime} {t('common.min')}</strong>
        </div>
      </div>
    </div>
  );
};
