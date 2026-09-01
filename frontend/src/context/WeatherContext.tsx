import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  NowcastResponse,
  GpsLocation,
  StormCellDetail,
  DemoScenario,
  ProviderMode,
  RiskLevel,
} from '../types/weather';
import { GeolocationService, GeolocationStatus } from '../services/geolocation';
import { fetchNowcast, updateScenario, updateProviderMode } from '../services/api';
import { NowcastWebSocketClient, WebSocketStatus } from '../services/websocket';
import { AudioAlertService, AlertSoundLevel } from '../services/audio';

interface WeatherContextType {
  // Geolocation
  gpsStatus: GeolocationStatus;
  location: GpsLocation | null;
  gpsError: string | null;
  requestGps: () => Promise<void>;

  // Nowcast State
  nowcast: NowcastResponse | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refreshNowcast: () => Promise<void>;

  // Interactive Map Controls
  selectedLeadTime: number;
  setSelectedLeadTime: (min: number) => void;
  selectedStormCell: StormCellDetail | null;
  setSelectedStormCell: (cell: StormCellDetail | null) => void;

  // Sound & Alert System (Simple & Automatic)
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<void>;
  acknowledgedAlerts: Set<string>;
  acknowledgeAlert: (alertId: string) => void;
  activeAlertDrawer: boolean;
  setActiveAlertDrawer: (open: boolean) => void;

  // Demo Alert System
  demoAlertOpen: boolean;
  setDemoAlertOpen: (open: boolean) => void;
  safetyAdviceOpen: boolean;
  setSafetyAdviceOpen: (open: boolean) => void;
  triggerDemoAlert: () => void;

  // Demo Mode
  scenario: DemoScenario;
  changeScenario: (scenario: DemoScenario) => Promise<void>;
  providerMode: ProviderMode;
  changeProviderMode: (mode: ProviderMode) => Promise<void>;

  // Connection
  wsStatus: WebSocketStatus;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gpsStatus, setGpsStatus] = useState<GeolocationStatus>('prompt');
  const [location, setLocation] = useState<GpsLocation | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [nowcast, setNowcast] = useState<NowcastResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedLeadTime, setSelectedLeadTime] = useState<number>(0);
  const [selectedStormCell, setSelectedStormCell] = useState<StormCellDetail | null>(null);

  // Sound enabled by default; AudioContext is initialized seamlessly on first user interaction
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());
  const [activeAlertDrawer, setActiveAlertDrawer] = useState<boolean>(false);

  // Demo Alert Popup & Safety Advice state
  const [demoAlertOpen, setDemoAlertOpen] = useState<boolean>(false);
  const [safetyAdviceOpen, setSafetyAdviceOpen] = useState<boolean>(false);

  const triggerDemoAlert = useCallback(() => {
    setSelectedLeadTime(30);
    setDemoAlertOpen(true);
    if (soundEnabled) {
      AudioAlertService.enable();
      AudioAlertService.playEmergencySiren();
    }
  }, [soundEnabled]);

  const [scenario, setScenario] = useState<DemoScenario>('SEVERE_CONVECTIVE_EVENT');
  const [providerMode, setProviderMode] = useState<ProviderMode>('demo');
  const [wsStatus, setWsStatus] = useState<WebSocketStatus>('disconnected');

  const wsClientRef = useRef<NowcastWebSocketClient | null>(null);
  const playedAlertIdsRef = useRef<Set<string>>(new Set());
  const previousRiskLevelRef = useRef<RiskLevel>('LOW');

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    AudioAlertService.setEnabled(enabled);
  };

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
      } catch (e) {
        console.warn('Failed to request notification permission', e);
      }
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAcknowledgedAlerts((prev) => new Set([...prev, alertId]));
  };

  // Helper to extract highest risk level from nowcast response
  const computeOverallRisk = (data: NowcastResponse): RiskLevel => {
    const risks: RiskLevel[] = [
      data.hazards?.thunderstorm?.risk_level || 'LOW',
      data.hazards?.hail?.risk_level || 'LOW',
      data.hazards?.cloudburst?.risk_level || 'LOW',
    ];
    if (risks.includes('SEVERE')) return 'SEVERE';
    if (risks.includes('HIGH')) return 'HIGH';
    if (risks.includes('MODERATE')) return 'MODERATE';
    return 'LOW';
  };

  // Trigger sound & notifications ONLY on actual state transitions
  const handleAlertTriggers = useCallback((data: NowcastResponse) => {
    const currentRisk = computeOverallRisk(data);
    const prevRisk = previousRiskLevelRef.current;

    // Determine if risk escalated (state transition)
    let shouldPlayTone: AlertSoundLevel | null = null;

    if (currentRisk === 'SEVERE' && prevRisk !== 'SEVERE') {
      shouldPlayTone = 'SEVERE';
    } else if (currentRisk === 'HIGH' && (prevRisk === 'LOW' || prevRisk === 'MODERATE')) {
      shouldPlayTone = 'WARNING';
    } else if (currentRisk === 'MODERATE' && prevRisk === 'LOW') {
      shouldPlayTone = 'WATCH';
    }

    if (shouldPlayTone) {
      AudioAlertService.playAlert(shouldPlayTone);
    }

    previousRiskLevelRef.current = currentRisk;

    // Visual/browser notifications for unplayed alert IDs
    if (data.active_alerts && data.active_alerts.length > 0) {
      for (const alert of data.active_alerts) {
        if (!playedAlertIdsRef.current.has(alert.alert_id)) {
          playedAlertIdsRef.current.add(alert.alert_id);

          // If no transition tone played but this is a new severe/warning alert, trigger sound
          if (!shouldPlayTone && (alert.priority === 'SEVERE' || alert.priority === 'WARNING')) {
            AudioAlertService.playAlert(alert.priority as AlertSoundLevel);
          }

          // Send browser notification if permitted
          if (
            typeof window !== 'undefined' &&
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            try {
              new Notification(alert.title, {
                body: alert.message,
                icon: '/favicon.ico',
                tag: alert.alert_id,
              });
            } catch (e) {
              console.warn('Could not post notification', e);
            }
          }
        }
      }
    }
  }, []);

  // Fetch nowcast data for coordinates
  const loadNowcast = useCallback(
    async (loc: GpsLocation, isBackground: boolean = false) => {
      if (!isBackground) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      try {
        const data = await fetchNowcast(loc.latitude, loc.longitude, loc.accuracy_m || undefined);
        setNowcast(data);
        if (data.scenario) {
          setScenario(data.scenario as DemoScenario);
        }
        setProviderMode(data.provider_mode);
        handleAlertTriggers(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error retrieving nowcast';
        setError(msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [handleAlertTriggers]
  );

  // Request browser GPS (Initializes Web Audio API seamlessly upon user gesture)
  const requestGps = async () => {
    AudioAlertService.enable().catch(() => {});
    setGpsStatus('requesting');
    setGpsError(null);

    try {
      const loc = await GeolocationService.requestLocation();
      setLocation(loc);
      setGpsStatus('granted');
      await loadNowcast(loc);

      // Connect WebSocket for live updates
      if (!wsClientRef.current) {
        wsClientRef.current = new NowcastWebSocketClient({
          onNowcastUpdate: (data) => {
            setNowcast(data);
            handleAlertTriggers(data);
          },
          onStatusChange: (status) => setWsStatus(status),
        });
      }
      wsClientRef.current.connect(loc.latitude, loc.longitude);

      // Start position watching
      GeolocationService.startWatching(
        (updatedLoc) => {
          setLocation(updatedLoc);
          wsClientRef.current?.subscribeLocation(updatedLoc.latitude, updatedLoc.longitude);
        },
        (err) => console.warn('GPS watch error:', err.message)
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'GPS permission denied or unavailable';
      setGpsError(msg);
      setGpsStatus('denied');
    }
  };

  const refreshNowcast = async () => {
    if (location) {
      await loadNowcast(location, true);
    }
  };

  const changeScenario = async (newScenario: DemoScenario) => {
    AudioAlertService.enable().catch(() => {});
    setScenario(newScenario);
    if (location) {
      setIsRefreshing(true);
      try {
        const res = await updateScenario(newScenario, location.latitude, location.longitude);
        if (res.nowcast) {
          setNowcast(res.nowcast);
          handleAlertTriggers(res.nowcast);
        } else {
          await loadNowcast(location, true);
        }
      } catch (e) {
        console.error('Failed to change scenario', e);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const changeProviderMode = async (newMode: ProviderMode) => {
    setProviderMode(newMode);
    try {
      await updateProviderMode(newMode);
      if (location) {
        await loadNowcast(location, true);
      }
    } catch (e) {
      console.error('Failed to change provider mode', e);
    }
  };

  // Periodic refresh fallback every 20 seconds (does NOT replay sound if risk has not changed)
  useEffect(() => {
    if (!location) return;
    const interval = setInterval(() => {
      loadNowcast(location, true);
    }, 20000);
    return () => clearInterval(interval);
  }, [location, loadNowcast]);

  return (
    <WeatherContext.Provider
      value={{
        gpsStatus,
        location,
        gpsError,
        requestGps,
        nowcast,
        isLoading,
        isRefreshing,
        error,
        refreshNowcast,
        selectedLeadTime,
        setSelectedLeadTime,
        selectedStormCell,
        setSelectedStormCell,
        soundEnabled,
        setSoundEnabled,
        notificationPermission,
        requestNotificationPermission,
        acknowledgedAlerts,
        acknowledgeAlert,
        activeAlertDrawer,
        setActiveAlertDrawer,
        demoAlertOpen,
        setDemoAlertOpen,
        safetyAdviceOpen,
        setSafetyAdviceOpen,
        triggerDemoAlert,
        scenario,
        changeScenario,
        providerMode,
        changeProviderMode,
        wsStatus,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const ctx = useContext(WeatherContext);
  if (!ctx) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return ctx;
};
