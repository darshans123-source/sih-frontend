import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Clock, TrendingUp, CloudRain, Zap, CloudHail, CloudLightning } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { TimelineStep } from '../types/weather';

export const TimelineCharts: React.FC = () => {
  const { nowcast, selectedLeadTime, setSelectedLeadTime } = useWeather();
  const timeline = nowcast?.timeline || [];
  const [activeMetric, setActiveMetric] = useState<'all' | 'rain' | 'convective'>('all');

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'SEVERE':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'HIGH':
        return 'bg-orange-950 text-orange-300 border-orange-800';
      case 'MODERATE':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'LOW':
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    }
  };

  return (
    <div className="bg-radar-panel border border-radar-border rounded-xl p-4 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-radar-border pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              0–60 Min Convective Nowcast Trajectory
            </h2>
            <p className="text-[11px] text-slate-400">
              Temporal Hazard Probability &amp; Rainfall Intensity Curves
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 text-xs font-medium">
          <button
            onClick={() => setActiveMetric('all')}
            className={`px-2.5 py-1 rounded-md transition ${
              activeMetric === 'all'
                ? 'bg-sky-500 text-white font-semibold'
                : 'bg-radar-surface text-slate-400 hover:text-slate-200 border border-radar-border'
            }`}
          >
            Multi-Hazard
          </button>
          <button
            onClick={() => setActiveMetric('rain')}
            className={`px-2.5 py-1 rounded-md transition ${
              activeMetric === 'rain'
                ? 'bg-sky-500 text-white font-semibold'
                : 'bg-radar-surface text-slate-400 hover:text-slate-200 border border-radar-border'
            }`}
          >
            Rainfall Rate (mm/h)
          </button>
          <button
            onClick={() => setActiveMetric('convective')}
            className={`px-2.5 py-1 rounded-md transition ${
              activeMetric === 'convective'
                ? 'bg-sky-500 text-white font-semibold'
                : 'bg-radar-surface text-slate-400 hover:text-slate-200 border border-radar-border'
            }`}
          >
            Instability &amp; Hail
          </button>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tstormGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="hailGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="cloudburstGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as TimelineStep;
                  return (
                    <div className="bg-radar-panel/95 border border-radar-border p-3 rounded-lg shadow-xl text-xs space-y-1.5 backdrop-blur-md">
                      <div className="flex items-center justify-between gap-4 border-b border-slate-700 pb-1">
                        <span className="font-bold text-sky-400">{label}</span>
                        <span className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded border ${getRiskBadge(data.overall_risk)}`}>
                          {data.overall_risk}
                        </span>
                      </div>
                      <p className="text-amber-300">
                        Thunderstorm: <strong className="font-mono">{data.thunderstorm_probability}%</strong>
                      </p>
                      <p className="text-sky-300">
                        Severe Hail: <strong className="font-mono">{data.hail_probability}%</strong>
                      </p>
                      <p className="text-rose-400">
                        Cloudburst Deluge: <strong className="font-mono">{data.cloudburst_probability}%</strong>
                      </p>
                      <p className="text-cyan-300">
                        Rainfall Rate: <strong className="font-mono">{data.rainfall_intensity_mm_h} mm/h</strong>
                      </p>
                      <p className="text-slate-400">
                        Radar Core: <strong className="font-mono">{data.radar_reflectivity_dbz} dBZ</strong>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            {(activeMetric === 'all' || activeMetric === 'convective') && (
              <Area
                type="monotone"
                dataKey="thunderstorm_probability"
                name="Thunderstorm %"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#tstormGrad)"
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'convective') && (
              <Area
                type="monotone"
                dataKey="hail_probability"
                name="Hail %"
                stroke="#38bdf8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#hailGrad)"
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'convective') && (
              <Area
                type="monotone"
                dataKey="cloudburst_probability"
                name="Cloudburst %"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#cloudburstGrad)"
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'rain') && (
              <Area
                type="monotone"
                dataKey="rainfall_intensity_mm_h"
                name="Rain Rate (mm/h)"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#rainGrad)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Interval Comparison Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
        {timeline.map((step) => {
          const isSelected = selectedLeadTime === step.time_offset_min;
          return (
            <button
              key={step.time_offset_min}
              onClick={() => setSelectedLeadTime(step.time_offset_min)}
              className={`p-2.5 rounded-lg border text-left transition ${
                isSelected
                  ? 'bg-sky-950/70 border-sky-500/80 shadow-md shadow-sky-500/20'
                  : 'bg-radar-surface/60 hover:bg-slate-800/80 border-radar-border'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-slate-200">{step.label}</span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${getRiskBadge(step.overall_risk)}`}>
                  {step.overall_risk}
                </span>
              </div>
              <div className="space-y-0.5 text-[10px] font-mono">
                <div className="text-amber-400">T-Storm: {step.thunderstorm_probability}%</div>
                <div className="text-cyan-300">Rain: {step.rainfall_intensity_mm_h} mm/h</div>
                <div className="text-slate-400">{step.radar_reflectivity_dbz} dBZ</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
