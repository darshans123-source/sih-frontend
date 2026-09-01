import { GpsLocation } from '../types/weather';

export type GeolocationStatus = 'prompt' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'timeout';

export interface GeolocationState {
  status: GeolocationStatus;
  location: GpsLocation | null;
  errorMessage: string | null;
}

export class GeolocationService {
  private static watchId: number | null = null;

  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'geolocation' in navigator;
  }

  public static async requestLocation(): Promise<GpsLocation> {
    if (!this.isSupported()) {
      throw new Error('Geolocation is not supported by your browser.');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: GpsLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy_m: position.coords.accuracy || null,
            altitude_m: position.coords.altitude || null,
            timestamp: position.timestamp || Date.now(),
          };
          resolve(loc);
        },
        (error) => {
          let msg = 'Failed to acquire GPS location.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              msg = 'Location permission was denied. SIH26084 requires browser GPS permission for convective nowcasts.';
              break;
            case error.POSITION_UNAVAILABLE:
              msg = 'Location information is unavailable from your device GPS sensors.';
              break;
            case error.TIMEOUT:
              msg = 'Location acquisition timed out. Please retry.';
              break;
          }
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  public static startWatching(
    onSuccess: (loc: GpsLocation) => void,
    onError: (err: Error) => void
  ): void {
    if (!this.isSupported() || this.watchId !== null) return;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        onSuccess({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy_m: position.coords.accuracy || null,
          altitude_m: position.coords.altitude || null,
          timestamp: position.timestamp || Date.now(),
        });
      },
      (error) => {
        onError(new Error(error.message));
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 5000,
      }
    );
  }

  public static stopWatching(): void {
    if (this.watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}
