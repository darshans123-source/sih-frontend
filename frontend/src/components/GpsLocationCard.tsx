import React from 'react';
import {
  MapPin,
  Crosshair,
  Thermometer,
  Droplets,
  Gauge,
  Wind,
  CloudRain,
  Mountain,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

export const GpsLocationCard: React.FC = () => {
  const { location, nowcast } = useWeather();
  const metrics = nowcast?.atmospheric_metrics;

  const lat = location?.latitude ? location.latitude.toFixed(5) : '--';
  const lon = location?.longitude ? location.longitude.toFixed(5) : '--';
  const accuracy = location?.accuracy_m ? `±${Math.round(location.accuracy_m)}m` : '±8m';

  return (
    <div className="bg-radar-panel border border-radar-border rounded-xl p-4 shadow-lg space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-radar-border pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Crosshair className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              GPS Sector
            </h2>
            <p className="text-[11px] text-emerald-400 font-mono font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              GPS ACTIVE &bull; {accuracy}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          WGS-84
        </span>
      </div>

      {/* Primary Coordinates */}
      <div className="grid grid-cols-2 gap-2 bg-radar-surface/90 border border-radar-border/80 rounded-lg p-2.5 font-mono">
        <div>
          <span className="text-[10px] uppercase text-slate-400 block font-sans">Latitude</span>
          <span className="text-sm font-semibold text-slate-100">{lat}° N</span>
        </div>
        <div>
          <span className="text-[10px] uppercase text-slate-400 block font-sans">Longitude</span>
          <span className="text-sm font-semibold text-slate-100">{lon}° E</span>
        </div>
      </div>

      {/* Surface Meteorological Conditions */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Surface Sounding Parameters
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Temperature */}
          <div className="p-2 rounded-lg bg-radar-surface/60 border border-radar-border flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">Temperature</span>
              <span className="font-mono font-semibold text-slate-200">
                {metrics ? `${metrics.surface_temp_c}°C` : '--'}
              </span>
            </div>
          </div>

          {/* Dew Point */}
          <div className="p-2 rounded-lg bg-radar-surface/60 border border-radar-border flex items-center gap-2">
            <Droplets className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">Dew Point</span>
              <span className="font-mono font-semibold text-slate-200">
                {metrics ? `${metrics.surface_dewpoint_c}°C` : '--'}
              </span>
            </div>
          </div>

          {/* Pressure */}
          <div className="p-2 rounded-lg bg-radar-surface/60 border border-radar-border flex items-center gap-2">
            <Gauge className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">Pressure</span>
              <span className="font-mono font-semibold text-slate-200">
                {metrics ? `${metrics.surface_pressure_hpa} hPa` : '--'}
              </span>
            </div>
          </div>

          {/* Precipitable Water */}
          <div className="p-2 rounded-lg bg-radar-surface/60 border border-radar-border flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">PWAT (Moisture)</span>
              <span className="font-mono font-semibold text-slate-200">
                {metrics ? `${metrics.precipitable_water_mm} mm` : '--'}
              </span>
            </div>
          </div>

          {/* Bulk Wind Shear */}
          <div className="p-2 rounded-lg bg-radar-surface/60 border border-radar-border flex items-center gap-2">
            <Wind className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">0-6km Shear</span>
              <span className="font-mono font-semibold text-slate-200">
                {metrics ? `${metrics.bulk_shear_0_6km_mps} m/s` : '--'}
              </span>
            </div>
          </div>

          {/* Freezing Level */}
          <div className="p-2 rounded-lg bg-radar-surface/60 border border-radar-border flex items-center gap-2">
            <Mountain className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">0°C Freezing Lvl</span>
              <span className="font-mono font-semibold text-slate-200">
                {metrics ? `${Math.round(metrics.freezing_level_m)} m` : '--'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Station / Radar coverage badge */}
      <div className="pt-2 border-t border-radar-border flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Doppler Radar: Online
        </span>
        <span className="font-mono text-slate-500">Scan: 250km</span>
      </div>
    </div>
  );
};
