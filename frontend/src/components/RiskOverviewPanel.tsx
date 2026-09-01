import React from 'react';
import {
  Zap,
  CloudHail,
  CloudLightning,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertOctagon,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { HazardDetail, RiskLevel, TrendDirection } from '../types/weather';

export const RiskOverviewPanel: React.FC = () => {
  const { nowcast } = useWeather();
  const hazards = nowcast?.hazards;

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'SEVERE':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'HIGH':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'MODERATE':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'LOW':
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  const getRiskBarColor = (level: RiskLevel) => {
    switch (level) {
      case 'SEVERE':
        return 'bg-gradient-to-r from-orange-500 to-rose-600 shadow-[0_0_10px_#f43f5e]';
      case 'HIGH':
        return 'bg-gradient-to-r from-amber-500 to-orange-500';
      case 'MODERATE':
        return 'bg-gradient-to-r from-emerald-500 to-amber-500';
      case 'LOW':
      default:
        return 'bg-emerald-500';
    }
  };

  const renderTrendIcon = (trend: TrendDirection) => {
    switch (trend) {
      case 'RAPIDLY_INTENSIFYING':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 uppercase">
            <TrendingUp className="w-3.5 h-3.5 text-rose-400 animate-bounce" /> Rapid Growth
          </span>
        );
      case 'INCREASING':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-orange-400 uppercase">
            <TrendingUp className="w-3.5 h-3.5" /> Increasing
          </span>
        );
      case 'DECREASING':
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 uppercase">
            <TrendingDown className="w-3.5 h-3.5" /> Weakening
          </span>
        );
      case 'STABLE':
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 uppercase">
            <Minus className="w-3.5 h-3.5" /> Steady
          </span>
        );
    }
  };

  const renderHazardCard = (
    title: string,
    icon: React.ReactNode,
    hazard: HazardDetail | undefined,
    indicatorLabel: string,
  ) => {
    const level: RiskLevel = hazard?.risk_level || 'LOW';
    const prob = hazard?.probability || 0;
    const conf = hazard?.confidence || 75;
    const trend = hazard?.trend || 'STABLE';

    return (
      <div className={`p-3.5 rounded-xl border bg-radar-surface/70 transition ${getRiskColor(level)}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-700/60">
              {icon}
            </div>
            <div>
              <span className="font-bold text-xs text-slate-100 tracking-wide block">
                {title}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {indicatorLabel}
              </span>
            </div>
          </div>
          <span className={`text-[11px] font-mono font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider border ${getRiskColor(level)}`}>
            {level}
          </span>
        </div>

        {/* Probability Progress Bar */}
        <div className="space-y-1.5 my-2.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400 text-[11px]">Hazard Probability:</span>
            <span className="font-bold text-slate-200">{prob}%</span>
          </div>
          <div className="h-2 w-full bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className={`h-full rounded-full transition-all duration-700 ${getRiskBarColor(level)}`}
              style={{ width: `${Math.min(100, Math.max(5, prob))}%` }}
            />
          </div>
        </div>

        {/* Metrics Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] font-mono">
          <div className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3 h-3 text-sky-400" />
            <span>Confidence: {conf}%</span>
          </div>
          <div>{renderTrendIcon(trend)}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-radar-panel border border-radar-border rounded-xl p-4 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-radar-border pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Convective Threat Matrix
            </h2>
            <p className="text-[11px] text-slate-400">
              Local GPS Area &bull; 0–60 Min Horizon
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-sky-400 bg-sky-950/60 border border-sky-800 px-2 py-0.5 rounded">
          CALCULATED
        </span>
      </div>

      {/* Hazard Cards */}
      <div className="space-y-3">
        {/* 1. Thunderstorm */}
        {renderHazardCard(
          'Thunderstorm & Lightning',
          <Zap className="w-4 h-4 text-amber-400" />,
          hazards?.thunderstorm,
          'CAPE & Shear Forcing'
        )}

        {/* 2. Severe Hail */}
        {renderHazardCard(
          'Severe Hail Risk',
          <CloudHail className="w-4 h-4 text-sky-300" />,
          hazards?.hail,
          'VIL & Freezing Level Index'
        )}

        {/* 3. Cloudburst / Torrential Deluge */}
        {renderHazardCard(
          'Cloudburst / Flash Deluge',
          <CloudLightning className="w-4 h-4 text-rose-400" />,
          hazards?.cloudburst,
          'Precipitation Rate > 75mm/h'
        )}
      </div>

      {/* Summary Advisory Pill */}
      <div className="p-3 rounded-lg bg-radar-surface/50 border border-radar-border text-[11px] text-slate-300 leading-relaxed">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200 mb-1">
          <AlertOctagon className="w-3.5 h-3.5 text-sky-400" />
          <span>Operational Guidance</span>
        </div>
        <p className="text-slate-400 text-[11px]">
          Threat levels reflect convective instability indices and Doppler advection vectors directly threatening your GPS coordinates.
        </p>
      </div>
    </div>
  );
};
