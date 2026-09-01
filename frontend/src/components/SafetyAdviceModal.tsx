import React from 'react';
import {
  ShieldAlert,
  Home,
  Trees,
  Maximize,
  Radio,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface SafetyAdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyAdviceModal: React.FC<SafetyAdviceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl border-2 border-rose-500 rounded-[28px] shadow-[0_20px_60px_rgba(225,29,72,0.3)] p-6 sm:p-7 text-slate-900 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 shrink-0">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-rose-600 uppercase block">
                EMERGENCY ACTION PROTOCOL
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                SEVERE WEATHER — TAKE PRECAUTION
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Emergency Directives */}
        <div className="space-y-2.5">
          <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200/80 flex items-start gap-3 text-rose-950">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold">Move indoors immediately</p>
              <p className="text-[11px] sm:text-xs text-rose-800 font-medium mt-0.5">
                Stay away from exposed outdoor locations and seek substantial shelter.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-3 text-amber-950">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Trees className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold">Avoid open fields & isolated trees</p>
              <p className="text-[11px] sm:text-xs text-amber-800 font-medium mt-0.5">
                Tall isolated objects attract cloud-to-ground lightning discharge.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/90 border border-sky-200/80 flex items-start gap-3 text-sky-950">
            <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Maximize className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold">Stay away from windows</p>
              <p className="text-[11px] sm:text-xs text-sky-800 font-medium mt-0.5">
                Damaging hail and microburst convective gusts can shatter exterior glass.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-slate-900">
            <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold">Follow official local guidance</p>
              <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-0.5">
                Monitor live radar soundings and district emergency broadcast channels.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Acknowledgement */}
        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Precaution protocol active</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            UNDERSTOOD
          </button>
        </div>
      </div>
    </div>
  );
};
