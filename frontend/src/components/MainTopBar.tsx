import React, { useState } from 'react';
import {
  Zap,
  MapPin,
  Volume2,
  VolumeX,
  Bell,
  RotateCw,
  FlaskConical,
  Check,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { DemoScenario } from '../types/weather';
import { useTranslation } from '../i18n';
import { LanguageSelector } from './LanguageSelector';

export const MainTopBar: React.FC<{
  onOpenAlerts: () => void;
  onOpenDetails?: () => void;
}> = ({ onOpenAlerts, onOpenDetails }) => {
  const {
    location,
    isRefreshing,
    refreshNowcast,
    soundEnabled,
    setSoundEnabled,
    scenario,
    changeScenario,
    nowcast,
    triggerDemoAlert,
  } = useWeather();

  const { t } = useTranslation();
  const [isScenarioMenuOpen, setIsScenarioMenuOpen] = useState(false);

  const latText = location?.latitude ? location.latitude.toFixed(4) : '16.1939';
  const lonText = location?.longitude ? location.longitude.toFixed(4) : '77.3698';

  const alertCount = nowcast?.active_alerts?.length || 1;

  const scenarios: { id: DemoScenario; nameKey: string; tagKey: string }[] = [
    { id: 'NORMAL', nameKey: 'demoScenarios.clear', tagKey: 'demoScenarios.clearTag' },
    { id: 'DEVELOPING_STORM', nameKey: 'demoScenarios.developing', tagKey: 'demoScenarios.developingTag' },
    { id: 'SEVERE_CONVECTIVE_EVENT', nameKey: 'demoScenarios.severe', tagKey: 'demoScenarios.severeTag' },
  ];

  const currentScenarioTag =
    scenario === 'SEVERE_CONVECTIVE_EVENT'
      ? t('demoScenarios.severeTag')
      : scenario === 'DEVELOPING_STORM'
      ? t('demoScenarios.developingTag')
      : t('demoScenarios.clearTag');

  return (
    <header className="sticky top-3 sm:top-4 z-40 w-full px-3 sm:px-6">
      <div className="max-w-[1920px] mx-auto floating-glass rounded-[22px] px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2.5 sm:gap-3">
        {/* Left: Brand & GPS Location */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-white flex items-center justify-center shadow-md shadow-sky-500/25 shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-lg font-black tracking-tight text-slate-900 leading-none">
                  {t('common.appName')}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-mono tracking-wider">
                  LIVE NOWCAST
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden sm:block truncate">
                CONVECTIVE WEATHER INTELLIGENCE
              </span>
            </div>
          </div>

          {/* GPS Live Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-slate-200/80 shadow-sm text-xs text-slate-700 font-medium shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <MapPin className="w-3.5 h-3.5 text-sky-500" />
            <span>
              {latText}°N, {lonText}°E
            </span>
            <span className="text-[10px] text-slate-400 font-mono">&bull; {t('common.gpsActive')}</span>
          </div>
        </div>

        {/* Right Controls: Demo Alert, Language Selector, Demo Mode, Sound, Alerts, Refresh */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Demo Alert Trigger Pill */}
          <button
            onClick={triggerDemoAlert}
            title="Simulate 30-Min Severe Weather Emergency Alert"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold transition shadow-sm cursor-pointer active:scale-95"
          >
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            <span className="hidden sm:inline">Demo Alert</span>
            <span className="sm:hidden">Alert</span>
          </button>

          {/* Language Selector */}
          <LanguageSelector />

          {/* Demo Scenario Pill */}
          <div className="relative">
            <button
              onClick={() => setIsScenarioMenuOpen(!isScenarioMenuOpen)}
              title={t('common.selectDemo')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/90 hover:bg-white border border-slate-200/90 text-slate-700 text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <FlaskConical className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">{t('common.demo')}</span>
              <span className="text-sky-600 font-semibold">{currentScenarioTag}</span>
            </button>

            {/* Scenario Dropdown */}
            {isScenarioMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  {t('common.selectDemo')}
                </div>
                <div className="py-1 space-y-1">
                  {scenarios.map((sc) => {
                    const isSelected = scenario === sc.id;
                    return (
                      <button
                        key={sc.id}
                        onClick={() => {
                          changeScenario(sc.id);
                          setIsScenarioMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <span className="block font-semibold">{t(sc.nameKey)}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {t(sc.tagKey)}
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-sky-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sound Toggle Pill */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? t('common.alertsOn') : t('common.alertsOff')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border text-xs font-bold transition shadow-sm cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-700'
                : 'bg-white/80 hover:bg-white border-slate-200 text-slate-500'
            }`}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">{t('common.alertsOn')}</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden md:inline">{t('common.alertsOff')}</span>
              </>
            )}
          </button>

          {/* Alerts Bell Button */}
          <button
            onClick={onOpenAlerts}
            title={t('alerts.alertCenter')}
            className="relative p-2 rounded-full floating-glass-btn text-slate-700 cursor-pointer"
          >
            <Bell className="w-4 h-4 text-rose-500" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-md">
                {alertCount}
              </span>
            )}
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => refreshNowcast()}
            disabled={isRefreshing}
            title={t('common.refresh')}
            className="p-2 rounded-full floating-glass-btn text-slate-700 cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 text-slate-700 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
