import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  Volume2,
  VolumeX,
  Navigation,
  ShieldAlert,
  X,
  Clock,
  MapPin,
  Flame,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { AudioAlertService } from '../services/audio';

interface DemoAlertPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onViewThreat?: () => void;
  onOpenSafetyAdvice?: () => void;
}

export const DemoAlertPopup: React.FC<DemoAlertPopupProps> = ({
  isOpen,
  onClose,
  onViewThreat,
  onOpenSafetyAdvice,
}) => {
  const { soundEnabled, setSoundEnabled } = useWeather();
  const [countdownSeconds, setCountdownSeconds] = useState(720); // 12 minutes (720s)
  const [audioBlocked, setAudioBlocked] = useState(false);

  useEffect(() => {
    AudioAlertService.setOnBlockedListener(() => {
      setAudioBlocked(true);
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCountdownSeconds(720);
    }
  }, [isOpen]);

  // Dynamic countdown timer
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 10 ? prev - 1 : 10));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const etaMinutes = Math.floor(countdownSeconds / 60);
  const etaSeconds = countdownSeconds % 60;
  const etaString = `${etaMinutes}m ${etaSeconds < 10 ? '0' : ''}${etaSeconds}s`;

  const handleToggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    if (newState) {
      AudioAlertService.enable();
      AudioAlertService.playEmergencySiren();
    } else {
      AudioAlertService.disable();
    }
  };

  const handleUnlockAudio = () => {
    AudioAlertService.enable();
    AudioAlertService.playEmergencySiren();
    setAudioBlocked(false);
    setSoundEnabled(true);
  };

  return (
    <>
      {/* 1. SUBTLE SCREEN-EDGE RED GLOW */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-[48] transition-opacity duration-700 animate-pulse"
        style={{
          boxShadow: 'inset 0 0 80px rgba(225, 29, 72, 0.38)',
        }}
      />

      {/* 2. AUDIO PERMISSION UNLOCK TOAST (If autoplay restricted) */}
      {audioBlocked && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-md animate-alert-slide-down">
          <div
            onClick={handleUnlockAudio}
            className="w-full p-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-between shadow-2xl cursor-pointer hover:bg-amber-400 transition"
          >
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-950 animate-bounce" />
              <span>🔔 CLICK TO ENABLE ALERT SOUND</span>
            </div>
            <span className="text-[11px] underline">Enable Siren →</span>
          </div>
        </div>
      )}

      {/* 3. PREMIUM RED EMERGENCY NOTIFICATION POPUP (Center/Right on Desktop, Centered on Mobile) */}
      <div className="fixed bottom-6 right-4 sm:right-6 md:right-8 z-50 w-[calc(100vw-2rem)] max-w-md animate-in fade-in slide-in-from-bottom-6 zoom-in-95 duration-300 select-none">
        <div className="w-full rounded-[28px] bg-slate-950/94 backdrop-blur-2xl border-2 border-rose-500 shadow-[0_20px_60px_rgba(225,29,72,0.45)] p-5 sm:p-6 text-white space-y-4 relative overflow-hidden">
          {/* Subtle Ambient Red Flare inside Card */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Header: Badge, Sound Toggle & Close Button */}
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 shrink-0 animate-pulse">
                <AlertOctagon className="w-6 h-6 fill-current/20" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-black tracking-widest text-rose-400 uppercase">
                    🔴 CRITICAL WEATHER ALERT
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight mt-0.5">
                  SEVERE THUNDERSTORM DETECTED
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Audio Toggle */}
              <button
                onClick={handleToggleSound}
                title={soundEnabled ? 'Mute Alert Sound' : 'Enable Alert Sound'}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-rose-400 animate-pulse" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                title="Close Alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed font-normal relative z-10">
            A severe convective cell is approaching your location with heavy precipitation and lightning.
          </p>

          {/* 3 Core Telemetry Metrics: 12 MIN | 8.4 KM | EXTREME */}
          <div className="grid grid-cols-3 gap-2 text-center relative z-10">
            {/* 12 MIN */}
            <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/40 shadow-xs">
              <p className="text-base sm:text-lg font-black text-rose-300 font-mono tracking-tight">
                {etaMinutes} MIN
              </p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Estimated arrival
              </p>
            </div>

            {/* 8.4 KM */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-xs">
              <p className="text-base sm:text-lg font-black text-white font-mono tracking-tight">
                8.4 KM
              </p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Distance
              </p>
            </div>

            {/* EXTREME */}
            <div className="p-3 rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-600/30">
              <p className="text-sm sm:text-base font-black tracking-wider leading-snug">
                EXTREME
              </p>
              <p className="text-[9px] text-rose-100 font-bold uppercase tracking-wider mt-0.5">
                Risk level
              </p>
            </div>
          </div>

          {/* Demo Watermark Notice */}
          <div className="text-[10px] text-slate-400 font-mono text-center pt-0.5">
            <span>[ DEMO DATA SIMULATION • 30 MIN NOWCAST ]</span>
          </div>

          {/* Action Buttons: VIEW THREAT & SAFETY ADVICE */}
          <div className="grid grid-cols-2 gap-2.5 pt-1 relative z-10">
            <button
              onClick={() => {
                if (onViewThreat) onViewThreat();
              }}
              className="py-2.5 sm:py-3 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/30 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Navigation className="w-4 h-4 fill-current/20" />
              <span>VIEW THREAT</span>
            </button>

            <button
              onClick={() => {
                if (onOpenSafetyAdvice) onOpenSafetyAdvice();
              }}
              className="py-2.5 sm:py-3 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 hover:border-white/40 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>SAFETY ADVICE</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
