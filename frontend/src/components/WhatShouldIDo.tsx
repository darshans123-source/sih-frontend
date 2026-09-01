import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { RiskLevel } from '../types/weather';
import { useTranslation } from '../i18n';

export const WhatShouldIDo: React.FC = () => {
  const { nowcast } = useWeather();
  const { t } = useTranslation();
  const [showFullGuidance, setShowFullGuidance] = useState(false);

  const risks: RiskLevel[] = [
    nowcast?.hazards?.thunderstorm?.risk_level || 'LOW',
    nowcast?.hazards?.hail?.risk_level || 'LOW',
    nowcast?.hazards?.cloudburst?.risk_level || 'LOW',
  ];

  let overallRisk: RiskLevel = 'LOW';
  if (risks.includes('SEVERE')) overallRisk = 'SEVERE';
  else if (risks.includes('HIGH')) overallRisk = 'HIGH';
  else if (risks.includes('MODERATE')) overallRisk = 'MODERATE';

  const adviceConfig = {
    LOW: {
      headline: t('guidance.calmAdvice'),
      color: 'text-emerald-700',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      actions: [
        t('guidance.calmAdvice'),
        t('guidance.emergencyHelpline'),
      ],
    },
    MODERATE: {
      headline: t('status.watchSubtitle'),
      color: 'text-amber-700',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      actions: [
        t('status.watchSubtitle'),
        t('guidance.lightningAdvice'),
        t('guidance.emergencyHelpline'),
      ],
    },
    HIGH: {
      headline: t('guidance.stayIndoors'),
      color: 'text-orange-700',
      badge: 'bg-orange-100 text-orange-800 border-orange-200',
      actions: [
        t('guidance.stayIndoors'),
        t('guidance.hailAdvice'),
        t('guidance.lightningAdvice'),
        t('guidance.emergencyHelpline'),
      ],
    },
    SEVERE: {
      headline: `🚨 ${t('guidance.stayIndoors')}`,
      color: 'text-rose-700',
      badge: 'bg-rose-100 text-rose-800 border-rose-200',
      actions: [
        t('guidance.stayIndoors'),
        t('guidance.hailAdvice'),
        t('guidance.lightningAdvice'),
        t('guidance.floodAdvice'),
        t('guidance.emergencyHelpline'),
      ],
    },
  }[overallRisk];

  return (
    <div className="floating-glass rounded-[24px] p-5 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {t('guidance.title')}
          </h3>
        </div>
      </div>

      <div className={`p-3.5 rounded-2xl border ${adviceConfig.badge}`}>
        <p className={`text-sm font-bold ${adviceConfig.color}`}>
          {adviceConfig.headline}
        </p>

        {showFullGuidance && (
          <ul className="mt-3 pt-3 border-t border-slate-200/80 space-y-2 text-xs text-slate-700 animate-in fade-in">
            {adviceConfig.actions.map((act, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{act}</span>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={() => setShowFullGuidance(!showFullGuidance)}
          className="mt-2.5 text-[11px] font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
        >
          <span>{showFullGuidance ? t('common.close') : t('common.viewThreat')}</span>
          {showFullGuidance ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
};
