import { NowcastResponse, ScenarioInfo, DemoScenario, ProviderMode, AlertItem, StormCellDetail, TimelineStep } from '../types/weather';

const API_BASE = '/api';

export async function fetchNowcast(latitude: number, longitude: number, accuracy_m?: number): Promise<NowcastResponse> {
  const res = await fetch(`${API_BASE}/nowcast`, {
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
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch nowcast' }));
    throw new Error(err.detail || 'Nowcast API returned an error');
  }

  return res.json();
}

export async function fetchScenarios(): Promise<ScenarioInfo[]> {
  const res = await fetch(`${API_BASE}/scenarios`);
  if (!res.ok) throw new Error('Failed to load scenarios');
  return res.json();
}

export async function updateScenario(scenario: DemoScenario, latitude?: number, longitude?: number): Promise<{ status: string; nowcast?: NowcastResponse }> {
  const res = await fetch(`${API_BASE}/scenarios/select`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scenario,
      latitude,
      longitude,
    }),
  });
  if (!res.ok) throw new Error('Failed to update scenario');
  return res.json();
}

export async function updateProviderMode(mode: ProviderMode): Promise<void> {
  const res = await fetch(`${API_BASE}/provider/mode?mode=${mode}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to update provider mode');
}

export async function fetchAlerts(latitude: number, longitude: number): Promise<AlertItem[]> {
  const res = await fetch(`${API_BASE}/alerts?lat=${latitude}&lon=${longitude}`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function fetchStormCells(latitude: number, longitude: number): Promise<StormCellDetail[]> {
  const res = await fetch(`${API_BASE}/storm-cells?lat=${latitude}&lon=${longitude}`);
  if (!res.ok) throw new Error('Failed to fetch storm cells');
  return res.json();
}

export async function fetchTimeline(latitude: number, longitude: number): Promise<TimelineStep[]> {
  const res = await fetch(`${API_BASE}/timeline?lat=${latitude}&lon=${longitude}`);
  if (!res.ok) throw new Error('Failed to fetch timeline');
  return res.json();
}
