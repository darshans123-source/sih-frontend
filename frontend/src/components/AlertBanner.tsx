import React from 'react';
import { AlertTriangle, ShieldAlert, Zap, CheckCircle2, Volume2, X } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { AlertItem } from '../types/weather';

export const AlertBanner: React.FC = () => {
  const { nowcast, acknowledgedAlerts, acknowledgeAlert } = useWeather();
  const alerts = nowcast?.active_alerts || [];

  // Find highest priority unacknowledged alert
  const unacknowledged = alerts.filter((a) => !acknowledgedAlerts.has(a.alert_id));

  if (unacknowledged.length === 0) return null;

  const currentAlert: AlertItem = unacknowledged[0];
  const isSevere = currentAlert.priority === 'SEVERE';

  return (
    <div
      className={`mx-4 mt-3 p-3.5 sm:p-4 rounded-xl border shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 animate-pulse-slow ${
        isSevere
          ? 'bg-rose-950/80 border-rose-500/80 text-rose-100 shadow-rose-950/50'
          : 'bg-amber-950/80 border-amber-500/80 text-amber-100 shadow-amber-950/50'
      }`}
    >
      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-[280px]">
        <div
          className={`p-2 rounded-xl border shrink-0 ${
            isSevere
              ? 'bg-rose-600 text-white border-rose-400'
              : 'bg-amber-500 text-slate-900 border-amber-300'
          }`}
        >
          {isSevere ? <ShieldAlert className="w-5 h-5 animate-bounce" /> : <AlertTriangle className="w-5 h-5" />}
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded tracking-wider border ${
                isSevere
                  ? 'bg-rose-900 text-white border-rose-400'
                  : 'bg-amber-900 text-amber-200 border-amber-400'
              }`}
            >
              {currentAlert.priority} &bull; {currentAlert.hazard_type}
            </span>
            <span className="text-[11px] text-slate-300 font-mono">
              Radius: {currentAlert.affected_radius_km} km
            </span>
          </div>
          <h3 className="text-sm font-extrabold tracking-tight">
            {currentAlert.title}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
            {currentAlert.message}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 self-end sm:self-center">
        <button
          onClick={() => acknowledgeAlert(currentAlert.alert_id)}
          className="px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono uppercase bg-white/10 hover:bg-white/20 border border-white/20 text-white transition flex items-center gap-1.5 cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Acknowledge Alert</span>
        </button>
      </div>
    </div>
  );
};
