import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES, SupportedLanguage } from '../i18n';

export const LanguageSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentOption =
    SUPPORTED_LANGUAGES.find((opt) => opt.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Change Language / भाषा बदलें / ಭಾಷೆ ಬದಲಾಯಿಸಿ"
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/90 hover:bg-white border border-slate-200/90 text-slate-700 text-xs font-bold transition shadow-sm cursor-pointer hover:border-slate-300"
      >
        <Globe className="w-3.5 h-3.5 text-sky-600 shrink-0" />
        <span className="font-bold tracking-wide">{currentOption.short}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
          <div className="space-y-0.5">
            {SUPPORTED_LANGUAGES.map((opt) => {
              const isSelected = language === opt.code;
              return (
                <button
                  key={opt.code}
                  onClick={() => {
                    setLanguage(opt.code as SupportedLanguage);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200'
                      : 'hover:bg-slate-100/80 text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{opt.native}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
