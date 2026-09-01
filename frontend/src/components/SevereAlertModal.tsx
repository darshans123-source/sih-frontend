import React from 'react';
import { AlertOctagon, Volume2, VolumeX, X, CheckCircle2 } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { useTranslation } from '../i18n';

export const SevereAlertModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { soundEnabled, setSoundEnabled, acknowledgedAlerts, acknowledgeAlert, nowcast } =
    useWeather();
  const { t } = useTranslation();

  if (!isOpen) return null;

  const alerts = nowcast?.active_alerts || [];
  const severeAlert = alerts.find((a) => a.priority === 'SEVERE') || alerts[0];
  const isAcknowledged = severeAlert ? acknowledgedAlerts.has(severeAlert.alert_id) : false;

  const handleAcknowledge = () => {
    if (severeAlert) {
      acknowledgeAlert(severeAlert.alert_id);
    }
    onClose();
  };

  const handleToggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl border-2 border-rose-500 rounded-[28px] shadow-2xl p-6 text-slate-800 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/30 animate-bounce">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-rose-600 uppercase block">
                🚨 {t('alerts.severeModalTitle')}
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {t('status.severeTitle')}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Sound Status Banner */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-rose-600 animate-pulse" />
                <span className="text-slate-800 font-bold font-mono">🔊 {t('common.alertsOn')}</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500 font-mono">🔇 {t('common.alertsOff')}</span>
              </>
            )}
          </div>

          <button
            onClick={handleToggleSound}
            className="px-3 py-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold transition shadow-sm cursor-pointer"
          >
            {soundEnabled ? t('common.alertsOff') : t('common.alertsOn')}
          </button>
        </div>

        {/* Message */}
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-sm space-y-1.5">
          <p className="font-bold text-rose-900 leading-relaxed">
            {t('status.severeSubtitle', { distance: 8.5 })}
          </p>
          <div className="flex items-center gap-2 text-xs text-rose-700 font-medium pt-1">
            <span>{t('landing.zoneTitle')}</span>
            <span>&bull;</span>
            <span>{t('timeline.min15')} ~ 13 {t('common.min')}</span>
          </div>
        </div>

        {/* Action Checklist */}
        <div className="space-y-1.5 pt-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            {t('guidance.title')}
          </span>
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{t('guidance.stayIndoors')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{t('guidance.floodAdvice')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{t('guidance.lightningAdvice')}</span>
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            {t('common.close')}
          </button>

          <button
            onClick={handleAcknowledge}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition cursor-pointer"
          >
            {isAcknowledged ? t('common.dismiss') : t('alerts.acknowledge')}
          </button>
        </div>
      </div>
    </div>
  );
};
