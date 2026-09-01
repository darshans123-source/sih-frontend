import React from 'react';
import { Clock } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { useTranslation } from '../i18n';

export const Next60MinTimeline: React.FC = () => {
  const { selectedLeadTime, setSelectedLeadTime, triggerDemoAlert, nowcast } = useWeather();
  const { t } = useTranslation();

  const nearestCell = nowcast?.storm_cells?.[0];
  const distanceKm = nearestCell?.distance_to_user_km
    ? Math.round(nearestCell.distance_to_user_km * 10) / 10
    : 8.5;

  const timeSteps = [
    {
      mins: 0,
      label: t('timeline.now'),
      risk: 'LOW',
      riskLabel: t('common.lowRisk'),
      emoji: '🟢',
      summary: t('timeline.nowDesc', { distance: distanceKm }),
    },
    {
      mins: 15,
      label: t('timeline.min15'),
      risk: 'HIGH',
      riskLabel: t('common.highUrgency'),
      emoji: '🟠',
      summary: t('timeline.min15Desc'),
    },
    {
      mins: 30,
      label: t('timeline.min30'),
      risk: 'SEVERE',
      riskLabel: t('common.severeRisk'),
      emoji: '🔴',
      summary: t('timeline.min30Desc'),
    },
    {
      mins: 45,
      label: t('timeline.min45'),
      risk: 'HIGH',
      riskLabel: t('common.highUrgency'),
      emoji: '🟠',
      summary: t('timeline.min45Desc'),
    },
    {
      mins: 60,
      label: t('timeline.min60'),
      risk: 'MODERATE',
      riskLabel: t('common.moderateRisk'),
      emoji: '🟡',
      summary: t('timeline.min60Desc'),
    },
  ];

  const currentStep = timeSteps.find((s) => s.mins === selectedLeadTime) || timeSteps[0];

  const getRiskStyle = (risk: string, isSelected: boolean) => {
    switch (risk) {
      case 'SEVERE':
        return isSelected
          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-110'
          : 'bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200';
      case 'HIGH':
        return isSelected
          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-110'
          : 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200';
      case 'MODERATE':
        return isSelected
          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-110'
          : 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200';
      default:
        return isSelected
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110'
          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200';
    }
  };

  return (
    <div className="floating-glass rounded-[24px] p-5 shadow-xl space-y-3.5">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {t('timeline.title')}
          </h3>
        </div>

        <span className="text-xs font-bold text-sky-700">
          {t('timeline.selected', { min: selectedLeadTime })}
        </span>
      </div>

      {/* Floating 5-Node Stepper */}
      <div className="relative pt-2 pb-1">
        {/* Connecting background bar */}
        <div className="absolute top-[22px] left-6 right-6 h-[3px] bg-slate-200 rounded-full z-0" />

        <div className="relative z-10 grid grid-cols-5 gap-1 text-center">
          {timeSteps.map((step) => {
            const isSelected = selectedLeadTime === step.mins;
            const nodeClass = getRiskStyle(step.risk, isSelected);

            return (
              <button
                key={step.mins}
                onClick={() => {
                  setSelectedLeadTime(step.mins);
                  if (step.mins === 30) {
                    triggerDemoAlert();
                  }
                }}
                className={`group flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  isSelected ? 'scale-105' : 'opacity-85 hover:opacity-100'
                }`}
              >
                {/* Circular Floating Node */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs border transition shadow-sm ${nodeClass}`}
                >
                  <span>{step.label}</span>
                </div>

                {/* Risk Dot */}
                <span className="text-[11px] font-bold text-slate-600">
                  {step.emoji}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Step Summary Card */}
      <div className="p-3 rounded-2xl bg-white/80 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-700">
        <span className="text-base mt-0.5">ℹ️</span>
        <div>
          <span className="font-bold text-slate-900 block">
            {currentStep.label} &bull; {currentStep.riskLabel}
          </span>
          <p className="text-slate-600 mt-0.5 leading-relaxed">{currentStep.summary}</p>
        </div>
      </div>
    </div>
  );
};
