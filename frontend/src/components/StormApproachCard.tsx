import React from 'react';
import { CloudLightning, ArrowRight } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { useTranslation } from '../i18n';

export const StormApproachCard: React.FC = () => {
  const { nowcast } = useWeather();
  const { t } = useTranslation();
  const cells = nowcast?.storm_cells || [];
  const primaryCell = cells[0];

  if (!primaryCell) {
    return (
      <div className="floating-glass rounded-[24px] p-5 shadow-xl flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-sm">
          <CloudLightning className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            {t('status.safeTitle')}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('status.safeSubtitle')}
          </p>
        </div>
      </div>
    );
  }

  const arrivalMin = primaryCell.estimated_arrival_min ?? 18;
  const isImminent = arrivalMin <= 20;
  const directionText =
    primaryCell.bearing_deg >= 337.5 || primaryCell.bearing_deg < 22.5
      ? 'North'
      : primaryCell.bearing_deg < 67.5
      ? 'NE'
      : primaryCell.bearing_deg < 112.5
      ? 'East'
      : primaryCell.bearing_deg < 157.5
      ? 'SE'
      : primaryCell.bearing_deg < 202.5
      ? 'South'
      : primaryCell.bearing_deg < 247.5
      ? 'SW'
      : primaryCell.bearing_deg < 292.5
      ? 'West'
      : 'NW';

  return (
    <div className="floating-glass rounded-[24px] p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-100 text-orange-700">
            <CloudLightning className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {t('approach.title')}
          </h3>
        </div>
        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
            isImminent
              ? 'bg-rose-100 text-rose-700 border-rose-200 animate-pulse'
              : 'bg-amber-100 text-amber-700 border-amber-200'
          }`}
        >
          {isImminent ? t('common.highUrgency') : t('common.moderateRisk')}
        </span>
      </div>

      {/* Main Countdown Box */}
      <div className="bg-white/90 rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
        <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
          {t('approach.estArrivalTitle')}
        </span>
        <div className="flex items-baseline justify-center gap-1.5 my-1">
          <span className="text-5xl font-black text-slate-900 tracking-tight">
            {arrivalMin}
          </span>
          <span className="text-sm font-bold text-slate-600 uppercase">
            {t('common.minutes')}
          </span>
        </div>
        <p className="text-xs font-semibold text-slate-600 mt-1">
          {t('approach.movingTowards', {
            bearing: directionText,
            speed: Math.round(primaryCell.speed_kmh),
          })}
        </p>
      </div>

      {/* Visual Flow: Storm -> 18m -> You */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white/70 border border-slate-200/70 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌩️</span>
          <div>
            <span className="font-bold text-slate-900 block leading-tight">{primaryCell.cell_id}</span>
            <span className="text-[10px] text-rose-600 font-bold">{primaryCell.max_dbz} dBZ</span>
          </div>
        </div>

        <div className="flex flex-col items-center px-2">
          <span className="text-[10px] font-bold text-amber-700">~{arrivalMin} {t('common.min')}</span>
          <div className="flex items-center gap-1 text-slate-400">
            <span className="h-[2px] w-6 bg-slate-300" />
            <ArrowRight className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="font-bold text-sky-700 block leading-tight">{t('approach.yourLocation')}</span>
            <span className="text-[10px] text-slate-500">{t('common.kmAway', { distance: primaryCell.distance_to_user_km })}</span>
          </div>
          <span className="text-2xl">📍</span>
        </div>
      </div>
    </div>
  );
};
