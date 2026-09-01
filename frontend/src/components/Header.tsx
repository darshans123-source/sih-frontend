import React from 'react';
import {
  Zap,
  Radio,
  Volume2,
  VolumeX,
  Bell,
  BellRing,
  RefreshCw,
  SlidersHorizontal,
  Layers,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

interface HeaderProps {
  onToggleDevMenu: () => void;
  isDevMenuOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleDevMenu, isDevMenuOpen }) => {
  const {
    nowcast,
    isRefreshing,
    refreshNowcast,
    soundEnabled,
    setSoundEnabled,
    notificationPermission,
    requestNotificationPermission,
    setActiveAlertDrawer,
    providerMode,
    wsStatus,
  } = useWeather();

  const activeAlertCount = nowcast?.active_alerts?.length || 0;
  const lastSyncTime = nowcast?.generated_at
    ? new Date(nowcast.generated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--:--:--';

  return (
    <header className="bg-radar-panel/95 backdrop-blur border-b border-radar-border px-4 py-3 sticky top-0 z-40 shadow-lg">
      <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & System Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-md shadow-sky-500/20">
            <Zap className="w-5 h-5 text-white animate-pulse" />
            <div className="absolute inset-0 rounded-xl border border-sky-400/40" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider text-slate-100 uppercase">
                VAYU-DRISHTI
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                SIH26084
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Convective-Scale Nowcasting &bull; Thunderstorm, Hail &amp; Cloudbursts
            </p>
          </div>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-xs">
          {/* Feed / Mode Status Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-radar-surface border border-radar-border">
            <span
              className={`w-2 h-2 rounded-full ${
                providerMode === 'live' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
              }`}
            />
            <span className="font-mono text-slate-300 font-semibold uppercase">
              {providerMode === 'live' ? 'LIVE DATA' : 'DEMO SCENARIO'}
            </span>
          </div>

          {/* WebSocket Status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-radar-surface border border-radar-border">
            <Radio
              className={`w-3.5 h-3.5 ${
                wsStatus === 'connected' ? 'text-emerald-400 animate-pulse' : 'text-slate-500'
              }`}
            />
            <span className="font-mono text-slate-300">
              {wsStatus === 'connected' ? 'STREAM: SYNCED' : 'STREAM: OFFLINE'}
            </span>
          </div>

          {/* Last Updated Timestamp */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-radar-surface border border-radar-border font-mono text-slate-400">
            <span>SYNC:</span>
            <span className="text-sky-300 font-semibold">{lastSyncTime}</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => refreshNowcast()}
            disabled={isRefreshing}
            className="p-1.5 rounded-md bg-radar-surface hover:bg-slate-800 text-slate-300 hover:text-white border border-radar-border transition disabled:opacity-50"
            title="Refresh Nowcast"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
          </button>

          {/* Audio Alert Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-md border transition flex items-center gap-1 ${
              soundEnabled
                ? 'bg-sky-950/60 border-sky-500/40 text-sky-400 hover:bg-sky-900/60'
                : 'bg-radar-surface border-radar-border text-slate-500 hover:text-slate-300'
            }`}
            title={soundEnabled ? 'Alert Audio ON (Web Audio Synthesized)' : 'Alert Audio MUTED'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Browser Notification Permission Button */}
          <button
            onClick={requestNotificationPermission}
            className={`p-1.5 rounded-md border transition ${
              notificationPermission === 'granted'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                : 'bg-radar-surface border-radar-border text-slate-400 hover:text-slate-200'
            }`}
            title={`Desktop Notifications: ${notificationPermission}`}
          >
            {notificationPermission === 'granted' ? (
              <BellRing className="w-4 h-4" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
          </button>

          {/* Active Alerts Bell / Drawer Trigger */}
          <button
            onClick={() => setActiveAlertDrawer(true)}
            className={`relative p-1.5 rounded-md border transition flex items-center gap-1.5 font-mono ${
              activeAlertCount > 0
                ? 'bg-rose-950/80 border-rose-500 text-rose-400 animate-pulse'
                : 'bg-radar-surface border-radar-border text-slate-400 hover:text-slate-200'
            }`}
            title="View Active Hazards"
          >
            <Layers className="w-4 h-4" />
            {activeAlertCount > 0 && (
              <span className="font-bold text-xs bg-rose-600 text-white rounded-full px-1.5 py-0.2">
                {activeAlertCount}
              </span>
            )}
          </button>

          {/* Dev / Judge Scenario Controls */}
          <button
            onClick={onToggleDevMenu}
            className={`px-2.5 py-1.5 rounded-md border transition flex items-center gap-1.5 font-medium ${
              isDevMenuOpen
                ? 'bg-sky-500 text-white border-sky-400'
                : 'bg-radar-surface hover:bg-slate-800 text-slate-300 border-radar-border'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scenario Control</span>
          </button>
        </div>
      </div>
    </header>
  );
};
