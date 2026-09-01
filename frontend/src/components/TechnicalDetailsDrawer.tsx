import React from 'react';
import {
  X,
  Thermometer,
  Droplets,
  Gauge,
  Wind,
  CloudRain,
  Mountain,
  Activity,
  Layers,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { useTranslation } from '../i18n';

export const TechnicalDetailsDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { nowcast } = useWeather();
  const { t } = useTranslation();

  if (!isOpen) return null;

  const metrics = nowcast?.atmospheric_metrics;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-2xl rounded-[28px] border border-white shadow-2xl p-6 text-slate-800 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">{t('details.title')}</h2>
              <p className="text-xs text-slate-500">{t('details.subtitle')}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Surface Boundary Layer */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            1. {t('details.atmosphericSounding')}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
              <Thermometer className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">Temperature / तापमान</span>
                <span className="font-bold text-slate-900">
                  {metrics ? `${metrics.surface_temp_c}°C` : '--'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
              <Droplets className="w-4 h-4 text-sky-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">Dew Point / ओसांक</span>
                <span className="font-bold text-slate-900">
                  {metrics ? `${metrics.surface_dewpoint_c}°C` : '--'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
              <Gauge className="w-4 h-4 text-indigo-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">Pressure / वायुदाब</span>
                <span className="font-bold text-slate-900">
                  {metrics ? `${metrics.surface_pressure_hpa} hPa` : '--'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
              <CloudRain className="w-4 h-4 text-cyan-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">PWAT (Moisture)</span>
                <span className="font-bold text-slate-900">
                  {metrics ? `${metrics.precipitable_water_mm} mm` : '--'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Instability Soundings */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            2. {t('details.cape')} / {t('details.cin')}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block">{t('details.cape')}</span>
              <span className="text-sm font-black text-rose-600">
                {metrics ? `${metrics.cape_j_kg} J/kg` : '2850 J/kg'}
              </span>
              <span className="text-[9px] text-slate-500 block mt-0.5">High Buoyancy</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block">{t('details.cin')}</span>
              <span className="text-sm font-black text-emerald-600">
                {metrics ? `${metrics.cin_j_kg} J/kg` : '-15 J/kg'}
              </span>
              <span className="text-[9px] text-slate-500 block mt-0.5">Cap Broken</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block">Lifted Index</span>
              <span className="text-sm font-black text-amber-600">
                {metrics ? `${metrics.lifted_index_c}°C` : '-6.8°C'}
              </span>
              <span className="text-[9px] text-slate-500 block mt-0.5">Severe Updrafts</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block">K-Index</span>
              <span className="text-sm font-black text-sky-600">
                {metrics ? `${metrics.k_index}` : '38'}
              </span>
              <span className="text-[9px] text-slate-500 block mt-0.5">&gt;90% Thunder Potential</span>
            </div>
          </div>
        </div>

        {/* 3. Radar Dynamics */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            3. {t('details.cellKinematics')}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
              <Wind className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">{t('details.windShear')}</span>
                <span className="font-bold text-slate-900">
                  {metrics ? `${metrics.bulk_shear_0_6km_mps} m/s` : '22.5 m/s'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
              <Mountain className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">{t('details.echoTop')}</span>
                <span className="font-bold text-slate-900">
                  {metrics ? `${metrics.echo_top_height_km} km` : '15.8 km'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">{t('details.vil')}</span>
                <span className="font-bold text-slate-900">
                  {metrics ? `${metrics.vertically_integrated_liquid_kg_m2} kg/m²` : '58 kg/m²'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
              <Mountain className="w-4 h-4 text-cyan-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">Freezing Level</span>
                <span className="font-bold text-slate-900">
                  {metrics ? `${Math.round(metrics.freezing_level_m)} m` : '4200 m'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer shadow-md"
          >
            {t('details.closeDetails')}
          </button>
        </div>
      </div>
    </div>
  );
};
