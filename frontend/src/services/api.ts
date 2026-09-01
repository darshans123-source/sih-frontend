import {
  NowcastResponse,
  ScenarioInfo,
  DemoScenario,
  ProviderMode,
  AlertItem,
  StormCellDetail,
  TimelineStep,
} from '../types/weather';

const API_BASE = ((import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE) || '/api';
const DEFAULT_TIMEOUT_MS = 12000;

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error: unknown) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please verify your connection.');
    }
    throw error;
  }
}

export async function fetchNowcast(
  latitude: number,
  longitude: number,
  accuracy_m?: number
): Promise<NowcastResponse> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/nowcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude,
        longitude,
        accuracy_m: accuracy_m || 10.0,
        timestamp_epoch: Date.now() / 1000,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: `Nowcast service responded with code ${res.status}` }));
      throw new Error(err.detail || 'Nowcast API returned an error');
    }

    return await res.json();
  } catch (err: unknown) {
    console.warn('API nowcast fetch notice:', err);
    throw err;
  }
}

export async function fetchScenarios(): Promise<ScenarioInfo[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/scenarios`);
    if (!res.ok) throw new Error(`Failed to load scenarios (${res.status})`);
    return await res.json();
  } catch (err) {
    console.warn('Scenarios fetch notice:', err);
    throw err;
  }
}

export async function updateScenario(
  scenario: DemoScenario,
  latitude?: number,
  longitude?: number
): Promise<{ status: string; nowcast?: NowcastResponse }> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/scenarios/select`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario,
        latitude,
        longitude,
      }),
    });
    if (!res.ok) throw new Error(`Failed to update scenario (${res.status})`);
    return await res.json();
  } catch (err) {
    console.warn('Scenario update notice:', err);
    throw err;
  }
}

export async function updateProviderMode(mode: ProviderMode): Promise<void> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/provider/mode?mode=${mode}`, { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to update provider mode (${res.status})`);
  } catch (err) {
    console.warn('Provider mode update notice:', err);
    throw err;
  }
}

export async function fetchAlerts(latitude: number, longitude: number): Promise<AlertItem[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/alerts?lat=${latitude}&lon=${longitude}`);
    if (!res.ok) throw new Error(`Failed to fetch alerts (${res.status})`);
    return await res.json();
  } catch (err) {
    console.warn('Alerts fetch notice:', err);
    throw err;
  }
}

export async function fetchStormCells(latitude: number, longitude: number): Promise<StormCellDetail[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/storm-cells?lat=${latitude}&lon=${longitude}`);
    if (!res.ok) throw new Error(`Failed to fetch storm cells (${res.status})`);
    return await res.json();
  } catch (err) {
    console.warn('Storm cells fetch notice:', err);
    throw err;
  }
}

export async function fetchTimeline(latitude: number, longitude: number): Promise<TimelineStep[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/timeline?lat=${latitude}&lon=${longitude}`);
    if (!res.ok) throw new Error(`Failed to fetch timeline (${res.status})`);
    return await res.json();
  } catch (err) {
    console.warn('Timeline fetch notice:', err);
    throw err;
  }
}
