import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CloudLightning,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { RiskLevel } from '../types/weather';
import { useTranslation } from '../i18n';

export const SafetyStatusBanner: React.FC<{ onOpenAlerts?: () => void }> = ({ onOpenAlerts }) => {
  const { nowcast } = useWeather();
  const { t } = useTranslation();

  const risks: RiskLevel[] = [
    nowcast?.hazards?.thunderstorm?.risk_level || 'LOW',
    nowcast?.hazards?.hail?.risk_level || 'LOW',
    nowcast?.hazards?.cloudburst?.risk_level || 'LOW',
  ];

  let overallRisk: RiskLevel = 'LOW';
  if (risks.includes('SEVERE')) overallRisk = 'SEVERE';
  else if (risks.includes('HIGH')) overallRisk = 'HIGH';
  else if (risks.includes('MODERATE')) overallRisk = 'MODERATE';

  const nearestCell = nowcast?.storm_cells?.[0];
  const etaMinutes = nearestCell?.estimated_arrival_min ?? (overallRisk === 'SEVERE' ? 13 : 18);
  const distanceKm = nearestCell?.distance_to_user_km
    ? Math.round(nearestCell.distance_to_user_km * 10) / 10
    : 9.3;

  const statusConfig = {
    LOW: {
      color: 'text-emerald-700',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
      dotColor: 'bg-emerald-500',
      icon: ShieldCheck,
      title: t('status.safeTitle'),
      emoji: '🟢',
      subtitle: t('status.safeSubtitle'),
      hasEta: false,
      hasAction: false,
      btnClass: '',
    },
    MODERATE: {
      color: 'text-amber-700',
      badgeBg: 'bg-amber-500/15 text-amber-600 border border-amber-500/25',
      dotColor: 'bg-amber-500',
      icon: AlertTriangle,
      title: t('status.watchTitle'),
      emoji: '🟡',
      subtitle: t('status.watchSubtitle'),
      hasEta: false,
      hasAction: Boolean(nowcast?.active_alerts && nowcast.active_alerts.length > 0),
      btnClass: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20 text-white',
    },
    HIGH: {
      color: 'text-orange-700',
      badgeBg: 'bg-orange-500/15 text-orange-600 border border-orange-500/25',
      dotColor: 'bg-orange-500',
      icon: CloudLightning,
      title: t('status.warningTitle'),
      emoji: '🟠',
      subtitle: t('status.warningSubtitle', { eta: etaMinutes, distance: distanceKm }),
      hasEta: true,
      hasAction: true,
      btnClass: 'bg-orange-600 hover:bg-orange-500 shadow-orange-600/20 text-white',
    },
    SEVERE: {
      color: 'text-rose-700',
      badgeBg: 'bg-rose-600 text-white shadow-md shadow-rose-600/25 animate-icon-pulse',
      dotColor: 'bg-rose-600',
      icon: AlertOctagon,
      title: t('status.severeTitle'),
      emoji: '🔴',
      subtitle: t('status.severeSubtitle', { distance: distanceKm }),
      hasEta: true,
      hasAction: true,
      btnClass: 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25 text-white',
    },
  }[overallRisk];

  const StatusIcon = statusConfig.icon;

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.7)',
        boxShadow: '0 10px 35px rgba(20, 50, 80, 0.15)',
        borderRadius: '18px',
      }}
      className="w-full transition-all duration-300 animate-alert-slide-down select-none"
    >
      {/* DESKTOP COMPACT ROW (Single horizontal bar ~70-76px) */}
      <div className="hidden md:flex items-center justify-between px-4 py-2.5 min-h-[72px] gap-4">
        {/* Left: Icon + Title + Secondary info */}
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Circular/Rounded Warning Badge with pulse when severe */}
          <div
            className={`w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 transition-transform ${statusConfig.badgeBg}`}
          >
            <StatusIcon className="w-5 h-5" />
          </div>

          {/* Text Summary */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusConfig.dotColor}`} />
              <h2 className="text-sm font-black tracking-tight text-slate-900 uppercase whitespace-nowrap">
                {statusConfig.title}
              </h2>
            </div>

            <span className="text-slate-300 font-light text-sm select-none">|</span>

            <p className="text-xs text-slate-600 font-medium truncate max-w-md">
              {statusConfig.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Time Badge + Action CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          {statusConfig.hasEta && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200/60 text-slate-800 text-xs font-black tracking-wide flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {etaMinutes} {t('common.min').toUpperCase()}
              </span>
            </div>
          )}

          {statusConfig.hasAction && onOpenAlerts && (
            <button
              onClick={onOpenAlerts}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer hover:scale-[1.03] active:scale-[0.98] ${statusConfig.btnClass}`}
            >
              <span>{t('common.viewThreat')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {!statusConfig.hasAction && overallRisk === 'LOW' && (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {t('common.sectorCalm')}
            </span>
          )}
        </div>
      </div>

      {/* MOBILE COMPACT TWO-LINE LAYOUT (~75-85px) */}
      <div className="md:hidden flex flex-col justify-center px-3.5 py-2.5 min-h-[75px] max-h-[90px] gap-1">
        {/* Row 1: Icon + Status + ETA */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${statusConfig.badgeBg}`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <span className={`w-2 h-2 rounded-full shrink-0 ${statusConfig.dotColor}`} />
              <h2 className="text-xs font-black tracking-tight text-slate-900 uppercase truncate">
                {statusConfig.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {statusConfig.hasEta && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-bold">
                {etaMinutes}m
              </span>
            )}
            {statusConfig.hasAction && onOpenAlerts && (
              <button
                onClick={onOpenAlerts}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-sm flex items-center gap-1 cursor-pointer ${statusConfig.btnClass}`}
              >
                <span>{t('common.view')}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Secondary text */}
        <div className="pl-8 text-[11px] text-slate-600 font-medium truncate">
          {statusConfig.subtitle}
        </div>
      </div>
    </div>
  );
};
