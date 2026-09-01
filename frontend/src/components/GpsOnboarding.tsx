import React from 'react';
import { Navigation, ShieldAlert, Compass, Satellite, AlertTriangle, ArrowRight } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

export const GpsOnboarding: React.FC = () => {
  const { gpsStatus, gpsError, requestGps } = useWeather();

  const isRequesting = gpsStatus === 'requesting';
  const isDenied = gpsStatus === 'denied';

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="relative max-w-xl w-full bg-radar-panel/90 border border-radar-border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl p-6 sm:p-8">
        {/* Atmospheric background glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Icon & Title */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <Navigation className={`w-7 h-7 ${isRequesting ? 'animate-spin' : 'animate-pulse'}`} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-sky-400">
              SIH26084 &bull; Convective Weather Intelligence
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Location Access Required
            </h1>
          </div>
        </div>

        {/* Core explanation */}
        <div className="space-y-4 text-slate-300 text-sm leading-relaxed mb-6">
          <p>
            Convective storms, severe hail, and cloudbursts initiate on a micro-scale of{' '}
            <strong className="text-sky-300 font-semibold">1 to 5 kilometers</strong>. Broad city forecasts cannot predict localized severe updrafts.
          </p>
          <p className="text-slate-400">
            This operational dashboard relies <strong className="text-slate-200">exclusively on your browser GPS sensors</strong> to calculate Doppler radar vectors, atmospheric instability soundings (CAPE/CIN), and 0–60 minute nowcasts at your exact location.
          </p>
        </div>

        {/* Technical Spec List */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-radar-surface/80 border border-radar-border">
            <Satellite className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="text-xs text-slate-300">High-Precision GPS Lock</span>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-radar-surface/80 border border-radar-border">
            <Compass className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-xs text-slate-300">0–60 Min Radar Advection</span>
          </div>
        </div>

        {/* Error Alert Box if Denied */}
        {isDenied && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 flex items-start gap-3 text-rose-200 text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-300 mb-1">GPS Permission Denied / Blocked</p>
              <p className="text-rose-200/90 leading-relaxed mb-2">
                {gpsError || 'Please click the site permissions icon in your browser URL bar and allow Location access to proceed.'}
              </p>
              <p className="text-slate-400 text-[11px]">
                Note: Per SIH26084 problem constraints, manual city search and mock IP geolocation are intentionally disabled.
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={requestGps}
          disabled={isRequesting}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {isRequesting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Acquiring Device GPS Coordinates...</span>
            </>
          ) : (
            <>
              <span>Enable GPS &amp; Generate Nowcast</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-500">
            Coordinates are processed strictly in your session and never stored with identifying personal data.
          </p>
        </div>
      </div>
    </div>
  );
};
