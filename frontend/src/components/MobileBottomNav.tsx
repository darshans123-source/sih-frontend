import React from 'react';
import { Home, Map, Clock, Bell } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { useTranslation } from '../i18n';

export type MobileTab = 'home' | 'map' | 'timeline' | 'alerts';

export const MobileBottomNav: React.FC<{
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
}> = ({ activeTab, onSelectTab }) => {
  const { nowcast } = useWeather();
  const { t } = useTranslation();
  const alertCount = nowcast?.active_alerts?.length || 1;

  const tabs: { id: MobileTab; labelKey: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', labelKey: 'mobile.home', icon: Home },
    { id: 'map', labelKey: 'mobile.map', icon: Map },
    { id: 'timeline', labelKey: 'mobile.timeline', icon: Clock },
    { id: 'alerts', labelKey: 'mobile.alerts', icon: Bell },
  ];

  return (
    <nav className="fixed bottom-3 left-4 right-4 z-40 floating-glass rounded-[22px] px-3 py-2 md:hidden shadow-2xl safe-area-bottom border border-white/80">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition cursor-pointer ${
                isActive ? 'text-sky-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.id === 'alerts' && alertCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center shadow-sm">
                    {alertCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] tracking-tight">{t(tab.labelKey)}</span>
              {isActive && (
                <span className="absolute -bottom-1 w-5 h-0.5 rounded-full bg-sky-600" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
