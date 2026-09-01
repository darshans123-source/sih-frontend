import { NowcastResponse } from '../types/weather';

export type WebSocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface WebSocketCallbacks {
  onNowcastUpdate?: (data: NowcastResponse) => void;
  onStatusChange?: (status: WebSocketStatus) => void;
  onError?: (err: Event | Error) => void;
}

export class NowcastWebSocketClient {
  private ws: WebSocket | null = null;
  private status: WebSocketStatus = 'disconnected';
  private callbacks: WebSocketCallbacks = {};
  private reconnectTimer: number | null = null;
  private pingInterval: number | null = null;
  private currentLat: number | null = null;
  private currentLon: number | null = null;

  constructor(callbacks: WebSocketCallbacks = {}) {
    this.callbacks = callbacks;
  }

  public connect(latitude: number, longitude: number) {
    this.currentLat = latitude;
    this.currentLon = longitude;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      this.subscribeLocation(latitude, longitude);
      return;
    }

    this.setStatus('connecting');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const url = `${protocol}//${host}/api/ws/nowcast`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.setStatus('connected');
        if (this.currentLat !== null && this.currentLon !== null) {
          this.subscribeLocation(this.currentLat, this.currentLon);
        }
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'nowcast_update' && msg.data) {
            this.callbacks.onNowcastUpdate?.(msg.data);
          }
        } catch (e) {
          console.error('Error parsing WS message', e);
        }
      };

      this.ws.onerror = (err) => {
        this.setStatus('error');
        this.callbacks.onError?.(err);
      };

      this.ws.onclose = () => {
        this.setStatus('disconnected');
        this.stopHeartbeat();
        this.scheduleReconnect();
      };
    } catch (e) {
      this.setStatus('error');
      this.scheduleReconnect();
    }
  }

  public subscribeLocation(lat: number, lon: number) {
    this.currentLat = lat;
    this.currentLon = lon;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe_location',
        latitude: lat,
        longitude: lon,
      }));
    }
  }

  public requestRefresh() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'refresh' }));
    }
  }

  public disconnect() {
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus('disconnected');
  }

  private setStatus(status: WebSocketStatus) {
    this.status = status;
    this.callbacks.onStatusChange?.(status);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 15000);
  }

  private stopHeartbeat() {
    if (this.pingInterval) {
      window.clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      if (this.currentLat !== null && this.currentLon !== null) {
        this.connect(this.currentLat, this.currentLon);
      }
    }, 5000);
  }
}
