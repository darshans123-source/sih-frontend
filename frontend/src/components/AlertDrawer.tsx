import React from 'react';
import { X, AlertTriangle, ShieldAlert, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { AlertItem } from '../types/weather';

export const AlertDrawer: React.FC = () => {
  const {
    nowcast,
    activeAlertDrawer,
    setActiveAlertDrawer,
    acknowledgedAlerts,
    acknowledgeAlert,
  } = useWeather();

  if (!activeAlertDrawer) return null;

  const alerts = nowcast?.active_alerts || [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-radar-panel border-l border-radar-border h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-radar-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              Convective Alerts Log
            </h3>
          </div>
          <button
            onClick={() => setActiveAlertDrawer(false)}
            className="p-1.5 rounded-lg bg-radar-surface hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-radar-border transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Alerts */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
              <p>No active convective alerts for your GPS area.</p>
            </div>
          ) : (
            alerts.map((alert: AlertItem) => {
              const isAck = acknowledgedAlerts.has(alert.alert_id);
              const isSevere = alert.priority === 'SEVERE';

              return (
                <div
                  key={alert.alert_id}
                  className={`p-3.5 rounded-xl border space-y-2 transition ${
                    isSevere
                      ? 'bg-rose-950/40 border-rose-500/40'
                      : 'bg-amber-950/40 border-amber-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                        isSevere
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}
                    >
                      {alert.priority} &bull; {alert.hazard_type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Radius: {alert.affected_radius_km}km
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-200">
                    {alert.title}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {alert.message}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-400" />
                      Issued: {new Date(alert.issued_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isAck ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Acknowledged
                      </span>
                    ) : (
                      <button
                        onClick={() => acknowledgeAlert(alert.alert_id)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
