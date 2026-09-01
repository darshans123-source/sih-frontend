import React, { useMemo } from 'react';
import { useWeather } from '../context/WeatherContext';
import { RiskLevel } from '../types/weather';

export const AtmosphericBackground: React.FC = () => {
  const { nowcast } = useWeather();

  const overallRisk: RiskLevel = useMemo(() => {
    if (!nowcast) return 'LOW';
    const risks: RiskLevel[] = [
      nowcast.hazards?.thunderstorm?.risk_level || 'LOW',
      nowcast.hazards?.hail?.risk_level || 'LOW',
      nowcast.hazards?.cloudburst?.risk_level || 'LOW',
    ];
    if (risks.includes('SEVERE')) return 'SEVERE';
    if (risks.includes('HIGH')) return 'HIGH';
    if (risks.includes('MODERATE')) return 'MODERATE';
    return 'LOW';
  }, [nowcast]);

  const ambientOverlayClass = {
    LOW: 'bg-sky-500/05',
    MODERATE: 'bg-amber-500/08',
    HIGH: 'bg-orange-500/10',
    SEVERE: 'bg-rose-600/12',
  }[overallRisk];

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none overflow-hidden z-[-1] bg-[#071326]"
    >
      {/* 1. Photorealistic Soft Natural Sky Photography Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-sky-drift transition-all duration-1000 scale-105 opacity-85"
        style={{
          backgroundImage: `url('/background-sky.jpg')`,
        }}
      />

      {/* 2. Soft Blue Atmospheric Glow & Deep Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/30 via-slate-950/40 to-slate-950/90" />

      {/* 3. Extremely Subtle Weather / Radar Concentric Geometry */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full border border-cyan-400/10 pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-[450px] h-[450px] rounded-full border border-dashed border-cyan-400/08 pointer-events-none" />
      <div className="absolute top-20 right-20 w-[300px] h-[300px] rounded-full border border-cyan-400/05 pointer-events-none" />

      {/* 4. Ambient Weather Severity Overlay */}
      <div
        className={`absolute inset-0 transition-colors duration-1000 ${ambientOverlayClass}`}
      />

      {/* 5. Soft Atmospheric Sunlight / Sky Glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-sky-400/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
    </div>
  );
};
