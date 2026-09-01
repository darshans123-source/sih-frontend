import React, { useState } from 'react';
import { SlidersHorizontal, Check, ShieldCheck, Zap, CloudSun, CloudHail, Radio, X } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { DemoScenario, ProviderMode } from '../types/weather';

interface DevScenarioSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DevScenarioSelector: React.FC<DevScenarioSelectorProps> = ({ isOpen, onClose }) => {
  const { scenario, changeScenario, providerMode, changeProviderMode } = useWeather();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const scenarios: { id: DemoScenario; name: string; desc: string; icon: React.ReactNode; badge: string; color: string }[] = [
    {
      id: 'NORMAL',
      name: '1. Fair Weather / Low Convection',
      desc: 'Stable troposphere, low CAPE (~380 J/kg), high CIN, zero radar echo cells.',
      icon: <CloudSun className="w-4 h-4 text-emerald-400" />,
      badge: 'LOW RISK',
      color: 'border-emerald-500/40 hover:bg-emerald-950/20',
    },
    {
      id: 'DEVELOPING_STORM',
      name: '2. Developing Convective Storm',
      desc: 'Moderate CAPE (1650 J/kg), 2 multicell clusters developing 15-25km upwind, moderate thunderstorm alert.',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      badge: 'MODERATE',
      color: 'border-amber-500/40 hover:bg-amber-950/20',
    },
    {
      id: 'SEVERE_CONVECTIVE_EVENT',
      name: '3. Severe Event (Hail & Cloudburst)',
      desc: 'Extreme CAPE (2850 J/kg), deep shear, severe 63 dBZ core moving over GPS position with destructive hail & deluge.',
      icon: <CloudHail className="w-4 h-4 text-rose-400" />,
      badge: 'SEVERE',
      color: 'border-rose-500/40 hover:bg-rose-950/20',
    },
  ];

  const handleScenarioChange = async (sId: DemoScenario) => {
    setIsUpdating(true);
    await changeScenario(sId);
    setIsUpdating(false);
  };

  const handleModeChange = async (m: ProviderMode) => {
    setIsUpdating(true);
    await changeProviderMode(m);
    setIsUpdating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-radar-panel border border-radar-border rounded-2xl shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-radar-border pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                Judge &amp; Demo Scenario Controls
              </h3>
              <p className="text-[11px] text-slate-400">
                SIH Evaluation Tools &bull; Anchored to your exact GPS coordinates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-radar-surface hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-radar-border transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Provider Mode Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Weather Data Provider Engine
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleModeChange('demo')}
              disabled={isUpdating}
              className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                providerMode === 'demo'
                  ? 'bg-sky-950/70 border-sky-500 text-white'
                  : 'bg-radar-surface border-radar-border text-slate-400 hover:text-slate-200'
              }`}
            >
              <div>
                <span className="font-bold text-xs block">Demo Simulator</span>
                <span className="text-[10px] text-slate-400">Deterministic Physical Physics</span>
              </div>
              {providerMode === 'demo' && <Check className="w-4 h-4 text-sky-400" />}
            </button>

            <button
              onClick={() => handleModeChange('live')}
              disabled={isUpdating}
              className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                providerMode === 'live'
                  ? 'bg-emerald-950/70 border-emerald-500 text-white'
                  : 'bg-radar-surface border-radar-border text-slate-400 hover:text-slate-200'
              }`}
            >
              <div>
                <span className="font-bold text-xs block">Live Atmospheric API</span>
                <span className="text-[10px] text-slate-400">Global Meteorological Sounding</span>
              </div>
              {providerMode === 'live' && <Check className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>

        {/* Scenarios List (Active when in Demo Mode) */}
        {providerMode === 'demo' && (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              Deterministic Meteorological Scenario
            </label>
            <div className="space-y-2">
              {scenarios.map((s) => {
                const isSelected = scenario === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleScenarioChange(s.id)}
                    disabled={isUpdating}
                    className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-radar-surface border-sky-500 shadow-md shadow-sky-500/10'
                        : `bg-radar-surface/60 ${s.color} border-radar-border`
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 mt-0.5">
                        {s.icon}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-200">{s.name}</span>
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {s.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {s.desc}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="p-1 rounded-full bg-sky-500/20 text-sky-400 mt-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-radar-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
