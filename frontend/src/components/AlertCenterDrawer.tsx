import React from 'react';
import { X, Bell, AlertOctagon, AlertTriangle, Eye, Volume2, VolumeX, CheckCircle } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { useTranslation } from '../i18n';

export const AlertCenterDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { soundEnabled, setSoundEnabled, acknowledgedAlerts, acknowledgeAlert } =
    useWeather();
  const { t } = useTranslation();

  if (!isOpen) return null;

  const alertHistory = [
    {
      id: 'alert-now-1',
      timeLabel: `🚨 ${t('common.now').toUpperCase()}`,
      title: t('status.severeTitle'),
      message: t('status.severeSubtitle', { distance: 8.5 }),
      priority: 'SEVERE',
      badge: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: AlertOctagon,
    },
    {
      id: 'alert-past-1',
      timeLabel: `⚠️ 12 ${t('common.min')}`,
      title: t('status.warningTitle'),
      message: t('status.warningSubtitle', { eta: 18, distance: 12.0 }),
      priority: 'WARNING',
      badge: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: AlertTriangle,
    },
    {
      id: 'alert-past-2',
      timeLabel: `👁️ 25 ${t('common.min')}`,
      title: t('status.watchTitle'),
      message: t('status.watchSubtitle'),
      priority: 'WATCH',
      badge: 'bg-sky-100 text-sky-800 border-sky-200',
      icon: Eye,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl border-l border-white h-full flex flex-col shadow-2xl p-6 overflow-y-auto text-slate-800 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">{t('alerts.alertCenter')}</h2>
              <p className="text-xs text-slate-500">{t('alerts.activeThreats')}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Toggle Bar */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
            <span>{t('common.alertsOn')}</span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {soundEnabled ? t('common.alertsOn') : t('common.alertsOff')}
          </button>
        </div>

        {/* List of Simple Alerts */}
        <div className="space-y-3 flex-1">
          {alertHistory.map((item) => {
            const isAck = acknowledgedAlerts.has(item.id);

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${item.badge}`}
                  >
                    {item.timeLabel}
                  </span>
                  {isAck && (
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {t('alerts.acknowledge')}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>

                {!isAck && (
                  <button
                    onClick={() => acknowledgeAlert(item.id)}
                    className="mt-2 text-[11px] font-bold text-sky-600 hover:text-sky-700 transition cursor-pointer"
                  >
                    {t('alerts.acknowledge')} &rarr;
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 text-center text-xs text-slate-500 font-medium">
          {t('common.appName')} &bull; {t('common.subtagline')}
        </div>
      </div>
    </div>
  );
};
