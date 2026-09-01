import React, { useState } from 'react';
import { useWeather } from './context/WeatherContext';
import { AtmosphericBackground } from './components/AtmosphericBackground';
import { HeroLanding } from './components/HeroLanding';
import { MainTopBar } from './components/MainTopBar';
import { SafetyStatusBanner } from './components/SafetyStatusBanner';
import { HeroMapSection } from './components/HeroMapSection';
import { StormApproachCard } from './components/StormApproachCard';
import { ThreatMatrixCard } from './components/ThreatMatrixCard';
import { Next60MinTimeline } from './components/Next60MinTimeline';
import { WhatShouldIDo } from './components/WhatShouldIDo';
import { TechnicalDetailsDrawer } from './components/TechnicalDetailsDrawer';
import { AlertCenterDrawer } from './components/AlertCenterDrawer';
import { SevereAlertModal } from './components/SevereAlertModal';
import { StormCellModal } from './components/StormCellModal';
import { MobileBottomNav, MobileTab } from './components/MobileBottomNav';
import { SplashScreen } from './components/SplashScreen';
import { CriticalAlertBanner } from './components/CriticalAlertBanner';
import { DemoAlertPopup } from './components/DemoAlertPopup';
import { SafetyAdviceModal } from './components/SafetyAdviceModal';
import { Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from './i18n';

export const AppContent: React.FC = () => {
  const {
    gpsStatus,
    isLoading,
    error,
    refreshNowcast,
    demoAlertOpen,
    setDemoAlertOpen,
    safetyAdviceOpen,
    setSafetyAdviceOpen,
    setSelectedLeadTime,
  } = useWeather();
  const { t } = useTranslation();
  const [showSplash, setShowSplash] = useState(true);
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('home');
  const [isAlertCenterOpen, setIsAlertCenterOpen] = useState(false);
  const [isSevereModalOpen, setIsSevereModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);

  // If GPS is not yet granted, show the realistic sky hero entry screen
  if (gpsStatus !== 'granted') {
    return (
      <div className="relative min-h-screen bg-[#0b1a2e]">
        {showSplash && (
          <SplashScreen
            duration={7000}
            onComplete={() => setShowSplash(false)}
          />
        )}
        <AtmosphericBackground />
        <HeroLanding />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-transparent flex flex-col text-slate-900 selection:bg-sky-500 selection:text-white pb-20 md:pb-8">
      {/* 7-Second Full-Screen Static Splash Screen */}
      {showSplash && (
        <SplashScreen
          duration={7000}
          onComplete={() => setShowSplash(false)}
        />
      )}

      {/* Photorealistic Atmospheric Background */}
      <AtmosphericBackground />

      {/* Floating Glass Navigation Bar */}
      <MainTopBar
        onOpenAlerts={() => setIsAlertCenterOpen(true)}
        onOpenDetails={() => setIsDetailsOpen(true)}
      />

      {/* Emergency Weather Alert System Banner */}
      <CriticalAlertBanner
        onViewThreatMap={() => {
          setSelectedLeadTime(30);
          const mapEl = document.querySelector('.leaflet-container');
          if (mapEl) {
            mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }}
        onOpenSafetyAdvice={() => setSafetyAdviceOpen(true)}
      />

      {/* Scanning Radar Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
          <div className="p-6 rounded-[28px] bg-white/95 border border-white shadow-2xl flex flex-col items-center gap-3 text-slate-800">
            <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
            <p className="text-sm font-bold text-slate-900">
              {t('common.loadingRadar')}
            </p>
            <p className="text-xs text-slate-500">
              {t('common.computingSectors')}
            </p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="max-w-6xl w-full mx-auto px-4 mt-3">
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-xs text-rose-800 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => refreshNowcast()}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold cursor-pointer transition shadow-sm"
            >
              {t('common.retry')}
            </button>
          </div>
        </div>
      )}

      {/* Main Floating Experience Body */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-3 sm:px-6 pt-3 sm:pt-4 space-y-4">
        {/* DESKTOP VIEW (Visible on md and larger) */}
        <div className="hidden md:flex flex-col space-y-4">
          {/* Top Floating Status Pill */}
          <SafetyStatusBanner onOpenAlerts={() => setIsAlertCenterOpen(true)} />

          {/* 3-Column Floating Grid: Left (Threats/Guidance) | Center Hero (Map 65%) | Right (Approach/Timeline) */}
          <div className="grid grid-cols-12 gap-4 items-start">
            {/* Left Floating Panel: What's Coming + Guidance */}
            <div className="col-span-3 space-y-4">
              <ThreatMatrixCard onToggleDetails={() => setIsDetailsOpen(true)} />
              <WhatShouldIDo />
            </div>

            {/* Center: Hero Map (65% visual weight) */}
            <div className="col-span-6">
              <HeroMapSection
                isFullscreen={isFullscreenMap}
                onToggleFullscreen={() => setIsFullscreenMap(!isFullscreenMap)}
              />
            </div>

            {/* Right Floating Panel: Storm Approach + 60 Min Timeline */}
            <div className="col-span-3 space-y-4">
              <StormApproachCard />
              <Next60MinTimeline />
            </div>
          </div>
        </div>

        {/* MOBILE VIEW (Tab-based, Touch-Friendly, Clean Flow) */}
        <div className="md:hidden space-y-4">
          {activeMobileTab === 'home' && (
            <>
              <SafetyStatusBanner onOpenAlerts={() => setIsAlertCenterOpen(true)} />
              <HeroMapSection />
              <StormApproachCard />
              <ThreatMatrixCard onToggleDetails={() => setIsDetailsOpen(true)} />
              <Next60MinTimeline />
              <WhatShouldIDo />
            </>
          )}

          {activeMobileTab === 'map' && (
            <div className="h-[75vh] w-full">
              <HeroMapSection isFullscreen={false} />
            </div>
          )}

          {activeMobileTab === 'timeline' && (
            <div className="space-y-4">
              <SafetyStatusBanner />
              <Next60MinTimeline />
              <StormApproachCard />
              <WhatShouldIDo />
            </div>
          )}

          {activeMobileTab === 'alerts' && (
            <div className="space-y-4">
              <SafetyStatusBanner />
              <ThreatMatrixCard onToggleDetails={() => setIsDetailsOpen(true)} />
              <WhatShouldIDo />
            </div>
          )}
        </div>
      </main>

      {/* Floating Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeMobileTab}
        onSelectTab={(tab) => {
          if (tab === 'alerts') {
            setIsAlertCenterOpen(true);
          } else {
            setActiveMobileTab(tab);
          }
        }}
      />

      {/* Modals & Floating Drawers */}
      <StormCellModal />
      <TechnicalDetailsDrawer
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
      <AlertCenterDrawer
        isOpen={isAlertCenterOpen}
        onClose={() => setIsAlertCenterOpen(false)}
      />
      <SevereAlertModal
        isOpen={isSevereModalOpen}
        onClose={() => setIsSevereModalOpen(false)}
      />

      {/* Real-time Emergency Demo Alert Popup */}
      <DemoAlertPopup
        isOpen={demoAlertOpen}
        onClose={() => setDemoAlertOpen(false)}
        onViewThreat={() => {
          setSelectedLeadTime(30);
          setDemoAlertOpen(false);
          const mapEl = document.querySelector('.leaflet-container');
          if (mapEl) {
            mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }}
        onOpenSafetyAdvice={() => {
          setSafetyAdviceOpen(true);
        }}
      />

      {/* Safety Advice Precaution Modal */}
      <SafetyAdviceModal
        isOpen={safetyAdviceOpen}
        onClose={() => setSafetyAdviceOpen(false)}
      />
    </div>
  );
};
