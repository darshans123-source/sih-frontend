import React from 'react';
import {
  X,
  Zap,
  CloudHail,
  CloudLightning,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { useTranslation } from '../i18n';

export const StormCellModal: React.FC = () => {
  const { selectedStormCell, setSelectedStormCell } = useWeather();
  const { t } = useTranslation();

  if (!selectedStormCell) return null;

  const cell = selectedStormCell;
  const isSevere = cell.max_dbz >= 55;

  const getCompassDirection = (deg: number) => {
    const dirs = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
    const idx = Math.round(deg / 45) % 8;
    return dirs[idx];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl border border-white rounded-[28px] shadow-2xl p-6 space-y-4 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md ${
                isSevere ? 'bg-rose-500 shadow-rose-500/30' : 'bg-amber-500 shadow-amber-500/30'
              }`}
            >
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  {cell.cell_id}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    isSevere ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {isSevere ? t('threats.severe') : t('threats.moderate')}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Centroid: {cell.centroid_lat.toFixed(4)}°N, {cell.centroid_lon.toFixed(4)}°E
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedStormCell(null)}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('details.radarReflectivity')}</span>
            <span className="text-xl font-black text-rose-600">
              {cell.max_dbz} <span className="text-xs font-medium text-slate-500">dBZ</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('details.speed')}</span>
            <span className="text-xl font-black text-sky-600">
              {cell.speed_kmh} <span className="text-xs font-medium text-slate-500">km/h</span>
            </span>
            <span className="text-[10px] text-slate-500 block">
              {getCompassDirection(cell.bearing_deg)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('map.distanceLabel')}</span>
            <span className="text-xl font-black text-slate-900">
              {cell.distance_to_user_km} <span className="text-xs font-medium text-slate-500">km</span>
            </span>
            {cell.estimated_arrival_min && (
              <span className="text-[10px] text-rose-600 font-bold block">
                {t('timeline.selected', { min: cell.estimated_arrival_min })}
              </span>
            )}
          </div>
        </div>

        {/* Secondary Details */}
        <div className="grid grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-400 block">{t('details.echoTop')}</span>
            <span className="font-bold text-slate-900">{cell.echo_top_km} km</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-400 block">{t('details.vil')}</span>
            <span className="font-bold text-slate-900">{cell.vil_kg_m2} kg/m²</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-400 block">{t('details.area')}</span>
            <span className="font-bold text-slate-900">{Math.round(cell.area_sq_km)} km²</span>
          </div>
        </div>

        {/* Threat Evaluation Breakdown */}
        <div className="space-y-2 pt-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {t('threats.whatsComing')}
          </h4>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="flex items-center gap-2 text-slate-700">
                <CloudHail className="w-4 h-4 text-sky-600" />
                {t('threats.hail')}
              </span>
              <span className="font-bold text-rose-600">
                {cell.vil_kg_m2 > 40 ? t('threats.high') : t('threats.moderate')}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="flex items-center gap-2 text-slate-700">
                <CloudLightning className="w-4 h-4 text-amber-600" />
                {t('threats.cloudburst')}
              </span>
              <span className="font-bold text-orange-600">
                {cell.max_dbz > 55 ? t('threats.severe') : t('threats.moderate')}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setSelectedStormCell(null)}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer shadow-md"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
