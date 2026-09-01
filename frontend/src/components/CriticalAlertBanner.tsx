import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ShieldCheck,
  Volume2,
  VolumeX,
  MapPin,
  Clock,
  Navigation,
  ShieldAlert,
  ChevronRight,
  X,
  Sparkles,
  Flame,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { AudioAlertService } from '../services/audio';

interface CriticalAlertProps {
  onViewThreatMap?: () => void;
  onOpenSafetyAdvice?: () => void;
}

export const CriticalAlertBanner: React.FC<CriticalAlertProps> = ({
  onViewThreatMap,
  onOpenSafetyAdvice,
}) => {
  const { nowcast, scenario, changeScenario, soundEnabled, setSoundEnabled } = useWeather();
  const [isDismissed, setIsDismissed] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(720); // 12 minutes (720s)
  const [hasPlayedSiren, setHasPlayedSiren] = useState(false);

  const isSevere = scenario === 'SEVERE_CONVECTIVE_EVENT' || nowcast?.hazards?.thunderstorm?.risk_level === 'SEVERE';
  const isWatch = scenario === 'DEVELOPING_STORM' || nowcast?.hazards?.thunderstorm?.risk_level === 'HIGH';

  // Check autoplay permission
  useEffect(() => {
    AudioAlertService.setOnBlockedListener(() => {
      setAudioBlocked(true);
    });
  }, []);

  // Trigger siren on severe alert activation
  useEffect(() => {
    if (isSevere && !hasPlayedSiren && soundEnabled) {
      AudioAlertService.playEmergencySiren();
      setHasPlayedSiren(true);
    }
  }, [isSevere, hasPlayedSiren, soundEnabled]);

  // Reset siren played flag when scenario changes
  useEffect(() => {
    if (!isSevere) {
      setHasPlayedSiren(false);
      setIsDismissed(false);
      setCountdownSeconds(720);
    }
  }, [scenario, isSevere]);

  // Countdown timer (12 min countdown)
  useEffect(() => {
    if (!isSevere) return;
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 10 ? prev - 1 : 10));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSevere]);

  const etaMinutes = Math.floor(countdownSeconds / 60);
  const etaSeconds = countdownSeconds % 60;
  const etaString = `${etaMinutes}m ${etaSeconds < 10 ? '0' : ''}${etaSeconds}s`;

  const handleUnlockAudio = () => {
    AudioAlertService.enable();
    AudioAlertService.playEmergencySiren();
    setAudioBlocked(false);
    setSoundEnabled(true);
  };

  return (
    <>
      {/* 1. SUBTLE SCREEN-EDGE RED GLOW WHEN CRITICAL ALERT ACTIVE */}
      {isSevere && !isDismissed && (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-[45] transition-opacity duration-700 animate-pulse"
          style={{
            boxShadow: 'inset 0 0 70px rgba(225, 29, 72, 0.35)',
          }}
        />
      )}

      {/* 2. AUDIO AUTOPLAY BLOCKED BANNER */}
      {audioBlocked && (
        <div className="sticky top-2 z-[60] w-full max-w-4xl mx-auto px-3 animate-alert-slide-down">
          <div
            onClick={handleUnlockAudio}
            className="w-full p-2.5 sm:p-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-between shadow-xl cursor-pointer hover:bg-amber-400 transition"
          >
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-950 animate-bounce" />
              <span>🔔 CLICK TO ENABLE ALERT SOUND</span>
            </div>
            <span className="text-[11px] underline">Enable Siren & Audio Alerts →</span>
          </div>
        </div>
      )}

      {/* 3. CRITICAL FULL-WIDTH TOP ALERT BANNER (Red Emergency Theme) */}
      {isSevere && (
        <div className="sticky top-3 sm:top-4 z-40 w-full px-3 sm:px-6 transition-all duration-300 animate-alert-slide-down">
          <div className="max-w-[1920px] mx-auto rounded-[24px] bg-gradient-to-r from-rose-950/95 via-rose-900/95 to-slate-950/95 border-2 border-rose-500/80 shadow-[0_12px_40px_rgba(225,29,72,0.38)] backdrop-blur-2xl p-3.5 sm:p-4 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
              {/* Left Alert Identification */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 shrink-0 animate-pulse">
                  <AlertOctagon className="w-6 h-6 fill-current/20" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black tracking-widest uppercase font-mono">
                      🔴 CRITICAL WEATHER ALERT
                    </span>
                    <span className="text-[11px] text-rose-300 font-bold hidden sm:inline">
                      DANGEROUS CONVECTIVE ACTIVITY DETECTED
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-black text-white tracking-tight truncate mt-0.5">
                    SEVERE THUNDERSTORM DETECTED
                  </h2>
                  <p className="text-xs text-rose-200/90 hidden md:block">
                    Dangerous convective cell with heavy lightning and hail approaching your location.
                  </p>
                </div>
              </div>

              {/* Center Telemetry Badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-rose-500/40 text-rose-200 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-white/60">THREAT:</span>
                  <span className="font-bold text-white">Severe Thunderstorm</span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-rose-500/40 text-rose-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-white/60">DISTANCE:</span>
                  <span className="font-bold text-white">8.4 km</span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-rose-500/40 text-rose-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-white/60">ARRIVAL:</span>
                  <span className="font-bold text-amber-300">{etaString}</span>
                </div>

                <div className="px-3 py-1.5 rounded-full bg-rose-600 text-white font-bold tracking-wider text-[11px] animate-pulse">
                  EXTREME
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {onViewThreatMap && (
                  <button
                    onClick={onViewThreatMap}
                    className="px-3.5 py-1.5 rounded-xl bg-white text-rose-950 hover:bg-rose-100 font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    VIEW MAP
                  </button>
                )}
                {onOpenSafetyAdvice && (
                  <button
                    onClick={onOpenSafetyAdvice}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-700/80 hover:bg-rose-600 text-white font-bold text-xs border border-rose-400/40 shadow-sm transition cursor-pointer"
                  >
                    SAFETY ADVICE
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. WATCH LEVEL AMBER BANNER */}
      {isWatch && !isSevere && (
        <div className="sticky top-3 sm:top-4 z-40 w-full px-3 sm:px-6 transition-all duration-300 animate-alert-slide-down">
          <div className="max-w-[1920px] mx-auto rounded-[22px] bg-gradient-to-r from-amber-950/90 via-amber-900/90 to-slate-950/90 border border-amber-500/60 shadow-lg p-3 sm:p-3.5 text-white flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                  🟡 WEATHER WATCH • CONVECTIVE ACTIVITY DEVELOPING
                </span>
                <p className="text-xs sm:text-sm font-bold text-white leading-tight">
                  Storm cell forming within 15 km sector — Estimated arrival ~24 min
                </p>
              </div>
            </div>
            {onOpenSafetyAdvice && (
              <button
                onClick={onOpenSafetyAdvice}
                className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition cursor-pointer shrink-0"
              >
                PRECAUTIONS
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. FLOATING CRITICAL ALERT CARD (Centered overlay / Modal Card) */}
      {isSevere && !isDismissed && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] animate-in fade-in slide-in-from-bottom-5 duration-300 select-none">
          <div className="w-full rounded-[28px] bg-white/95 backdrop-blur-2xl border-2 border-rose-500 shadow-[0_20px_50px_rgba(225,29,72,0.35)] p-5 sm:p-6 text-slate-900 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30 shrink-0 animate-pulse">
                  <AlertOctagon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black tracking-widest text-rose-600 uppercase block">
                    🔴 CRITICAL ALERT
                  </span>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none mt-0.5">
                    SEVERE THUNDERSTORM
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setIsDismissed(true)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                title="Dismiss Card"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Strong convective cell approaching your area with intense precipitation and lightning.
            </p>

            {/* 3 Telemetry Cards: 12 MIN | 8.4 KM | EXTREME */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-2xl bg-rose-50/90 border border-rose-200/80">
                <p className="text-sm font-black text-rose-700 font-mono">{etaMinutes} MIN</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Est. Arrival</p>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="text-sm font-black text-slate-900 font-mono">8.4 KM</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Distance</p>
              </div>

              <div className="p-2.5 rounded-2xl bg-rose-600 text-white shadow-sm">
                <p className="text-sm font-black tracking-wider">EXTREME</p>
                <p className="text-[9px] text-rose-100 font-bold uppercase mt-0.5">Risk Level</p>
              </div>
            </div>

            {/* Action Buttons: VIEW THREAT MAP | SAFETY ADVICE | DISMISS */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                {onViewThreatMap && (
                  <button
                    onClick={() => {
                      onViewThreatMap();
                      setIsDismissed(true);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>VIEW THREAT MAP</span>
                  </button>
                )}

                {onOpenSafetyAdvice && (
                  <button
                    onClick={onOpenSafetyAdvice}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    <span>SAFETY ADVICE</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsDismissed(true)}
                className="w-full py-2 text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                DISMISS
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
