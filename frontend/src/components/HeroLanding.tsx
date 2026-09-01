import React from 'react';
import {
  Navigation,
  ShieldCheck,
  Zap,
  Compass,
  ArrowRight,
  Clock,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { useTranslation } from '../i18n';
import { LanguageSelector } from './LanguageSelector';

export const HeroLanding: React.FC = () => {
  const { gpsStatus, gpsError, requestGps, changeScenario } = useWeather();
  const { t } = useTranslation();
  const isRequesting = gpsStatus === 'requesting';
  const isDenied = gpsStatus === 'denied';

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center px-4 py-6 sm:py-10 relative z-10 select-none">
      {/* 1. TOP HEADER BRANDING FLOATING GLASS PILL */}
      <header className="w-full max-w-5xl floating-glass rounded-full px-4 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between shadow-xl shadow-slate-900/10 border border-white/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-cyan-400 text-white flex items-center justify-center shadow-md shadow-sky-500/30 shrink-0">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-base sm:text-xl font-black tracking-tight text-slate-900 leading-none">
              VAYU-DRISHTI
            </span>
            <span className="block text-[9px] sm:text-[10px] text-sky-700 font-bold uppercase tracking-[0.14em] font-mono mt-0.5">
              CONVECTIVE WEATHER INTELLIGENCE
            </span>
          </div>
        </div>

        {/* Top Right Controls: Language Selector & Radar Online Status */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <LanguageSelector />
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-emerald-50/90 text-emerald-800 text-xs font-bold border border-emerald-200/80 shadow-sm backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="hidden sm:inline font-semibold">Doppler Radar Online</span>
            <span className="sm:hidden font-semibold">Online</span>
          </div>
        </div>
      </header>

      {/* 2. MAIN FLOATING GLASS HERO CARD */}
      <main className="w-full max-w-xl my-auto text-center floating-glass rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-2xl shadow-sky-950/15 space-y-6 sm:space-y-7 border border-white/90 relative overflow-hidden backdrop-blur-2xl">
        {/* Ambient Top Light Flare */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Real-Time Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50/90 border border-sky-200/80 text-sky-900 text-xs font-bold shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          <span className="tracking-wide">Real-Time Convective Weather Intelligence</span>
        </div>

        {/* Crisp Modern Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
            Know the storm <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 drop-shadow-sm">
              before it arrives.
            </span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed font-normal">
            Hyper-local, 0–60 minute early warnings for thunderstorms, damaging hail, and cloudbursts around your location.
          </p>
        </div>

        {/* 3. THREE PREMIUM FEATURE CARDS */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 text-left">
          {/* Card 1: 15 km Zone */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/85 hover:bg-white border border-slate-200/80 hover:border-sky-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="w-8 h-8 rounded-xl bg-sky-100/90 text-sky-700 flex items-center justify-center mb-2 shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">15 km Zone</p>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 leading-tight">Local sector scan</p>
          </div>

          {/* Card 2: 0–60 Min */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/85 hover:bg-white border border-slate-200/80 hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="w-8 h-8 rounded-xl bg-blue-100/90 text-blue-700 flex items-center justify-center mb-2 shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">0–60 Min</p>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 leading-tight">Live arrival ETA</p>
          </div>

          {/* Card 3: Clear Advice */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/85 hover:bg-white border border-slate-200/80 hover:border-emerald-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="w-8 h-8 rounded-xl bg-emerald-100/90 text-emerald-700 flex items-center justify-center mb-2 shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Clear Advice</p>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 leading-tight">What to do safely</p>
          </div>
        </div>

        {/* GPS Error State if Permission Denied */}
        {isDenied && (
          <div className="p-4 rounded-2xl bg-rose-50/90 border border-rose-200 text-left text-xs text-rose-900 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{t('landing.permNeeded')}</span>
            </div>
            <p className="leading-relaxed text-slate-600">
              {gpsError || t('landing.permSubtitle')}
            </p>
            <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">{t('landing.wantTest')}</span>
              <button
                onClick={() => changeScenario('SEVERE_CONVECTIVE_EVENT')}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm transition cursor-pointer"
              >
                {t('landing.launchDemo')}
              </button>
            </div>
          </div>
        )}

        {/* 4. MAIN CTA BUTTON & PRIVACY ASSURANCE */}
        <div className="space-y-3.5 pt-1">
          <button
            onClick={requestGps}
            disabled={isRequesting}
            className="w-full py-4 sm:py-4.5 px-8 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 hover:from-sky-400 hover:via-blue-500 hover:to-cyan-400 text-white font-bold text-base sm:text-lg shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/45 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 border border-white/20"
          >
            {isRequesting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Locating Your Area...</span>
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5 text-white fill-current/20" />
                <span className="tracking-wide">USE MY LOCATION</span>
                <ArrowRight className="w-5 h-5 text-white/90" />
              </>
            )}
          </button>

          {/* Privacy Message */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 max-w-md mx-auto leading-normal">
            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Your location is used strictly to check nearby weather threats. Zero personal data stored.</span>
          </div>
        </div>
      </main>

      {/* 5. CLEAN PRODUCTION FOOTER */}
      <footer className="w-full max-w-5xl text-center text-xs text-slate-400 font-medium py-2">
        <p>Real-Time Convective Weather Intelligence</p>
      </footer>
    </div>
  );
};
