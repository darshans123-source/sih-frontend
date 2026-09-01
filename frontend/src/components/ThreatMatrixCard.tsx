import React from 'react';
import { CloudLightning, Snowflake, CloudRain, Waves, ShieldAlert, ChevronRight } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { RiskLevel } from '../types/weather';
import { useTranslation } from '../i18n';

export const ThreatMatrixCard: React.FC<{ onToggleDetails?: () => void }> = ({ onToggleDetails }) => {
  const { nowcast } = useWeather();
  const { t } = useTranslation();

  const hazards = nowcast?.hazards;
  const thunderRisk: RiskLevel = hazards?.thunderstorm?.risk_level || 'HIGH';
  const hailRisk: RiskLevel = hazards?.hail?.risk_level || 'HIGH';
  const cloudburstRisk: RiskLevel = hazards?.cloudburst?.risk_level || 'SEVERE';

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'SEVERE':
        return {
          text: t('threats.severe'),
          badge: 'bg-rose-100 text-rose-700 border-rose-200',
          dot: 'bg-rose-600',
        };
      case 'HIGH':
        return {
          text: t('threats.high'),
          badge: 'bg-orange-100 text-orange-700 border-orange-200',
          dot: 'bg-orange-600',
        };
      case 'MODERATE':
        return {
          text: t('threats.moderate'),
          badge: 'bg-amber-100 text-amber-700 border-amber-200',
          dot: 'bg-amber-600',
        };
      default:
        return {
          text: t('threats.low'),
          badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-600',
        };
    }
  };

  const threats = [
    {
      id: 'thunderstorm',
      icon: CloudLightning,
      emoji: '🌩️',
      title: t('threats.thunderstorm'),
      desc: t('threats.thunderstormDesc'),
      risk: thunderRisk,
      badge: getRiskBadge(thunderRisk),
    },
    {
      id: 'hail',
      icon: Snowflake,
      emoji: '🧊',
      title: t('threats.hail'),
      desc: t('threats.hailDesc'),
      risk: hailRisk,
      badge: getRiskBadge(hailRisk),
    },
    {
      id: 'rain',
      icon: CloudRain,
      emoji: '🌧️',
      title: t('threats.heavyRain'),
      desc: t('threats.heavyRainDesc'),
      risk: thunderRisk === 'SEVERE' ? 'SEVERE' : 'HIGH',
      badge: getRiskBadge(thunderRisk === 'SEVERE' ? 'SEVERE' : 'HIGH'),
    },
    {
      id: 'cloudburst',
      icon: Waves,
      emoji: '🌊',
      title: t('threats.cloudburst'),
      desc: t('threats.cloudburstDesc'),
      risk: cloudburstRisk,
      badge: getRiskBadge(cloudburstRisk),
    },
  ];

  return (
    <div className="floating-glass rounded-[24px] p-4 sm:p-5 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {t('threats.whatsComing')}
          </h3>
        </div>

        {onToggleDetails && (
          <button
            onClick={onToggleDetails}
            className="text-[11px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-0.5 cursor-pointer transition"
          >
            <span>{t('common.scientificDetails')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        {threats.map((item) => (
          <div
            key={item.id}
            onClick={onToggleDetails}
            className="h-[74px] px-3.5 py-2.5 rounded-2xl bg-white/80 hover:bg-white border border-slate-200/80 hover:border-slate-300 shadow-sm flex items-center justify-between gap-3 transition cursor-pointer hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.emoji}</span>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">{item.title}</h4>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{item.desc}</p>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border shrink-0 flex items-center gap-1.5 ${item.badge.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${item.badge.dot}`} />
              {item.badge.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
