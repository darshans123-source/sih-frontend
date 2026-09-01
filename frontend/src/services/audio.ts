/**
 * Professional Web Audio API Emergency Alert Sound Service.
 * Generates authentic civil-defense / emergency weather warning sirens natively
 * without external audio dependencies or autoplay crashes.
 */

export type AlertSoundLevel = 'NORMAL' | 'WATCH' | 'WARNING' | 'SEVERE' | 'CRITICAL';

export class AudioAlertService {
  private static ctx: AudioContext | null = null;
  private static enabled: boolean = true;
  private static isUnlocked: boolean = false;
  private static onBlockedCallback: (() => void) | null = null;

  public static isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean(
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    );
  }

  public static setOnBlockedListener(cb: () => void) {
    this.onBlockedCallback = cb;
  }

  public static async getContext(): Promise<AudioContext | null> {
    if (!this.isSupported()) return null;

    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }

      if (this.ctx.state === 'suspended') {
        try {
          await this.ctx.resume();
          this.isUnlocked = true;
        } catch {
          if (this.onBlockedCallback) this.onBlockedCallback();
        }
      } else if (this.ctx.state === 'running') {
        this.isUnlocked = true;
      }
      return this.ctx;
    } catch {
      if (this.onBlockedCallback) this.onBlockedCallback();
      return null;
    }
  }

  public static async enable(): Promise<boolean> {
    this.enabled = true;
    const ctx = await this.getContext();
    if (ctx && ctx.state === 'running') {
      this.isUnlocked = true;
      return true;
    }
    return true;
  }

  public static disable(): void {
    this.enabled = false;
  }

  public static isEnabled(): boolean {
    return this.enabled;
  }

  public static setEnabled(enabled: boolean): void {
    if (enabled) {
      this.enable();
    } else {
      this.disable();
    }
  }

  public static getIsUnlocked(): boolean {
    return this.isUnlocked;
  }

  /**
   * REALISTIC 2.5–3.0 SECOND EMERGENCY WEATHER SIREN:
   * Dual-tone alternating civil warning frequency warble (880Hz <-> 660Hz)
   * with deep sub-bass pulse followed by high-urgency telemetry alert chimes.
   */
  public static async playEmergencySiren(): Promise<void> {
    if (!this.enabled) return;

    const ctx = await this.getContext();
    if (!ctx || ctx.state !== 'running') {
      if (this.onBlockedCallback) this.onBlockedCallback();
      return;
    }

    try {
      const now = ctx.currentTime;

      // 1. Dual-Tone Emergency Siren Warble (Oscillates between 880Hz and 660Hz)
      const sirenOsc = ctx.createOscillator();
      const sirenGain = ctx.createGain();
      const sirenFilter = ctx.createBiquadFilter();

      sirenOsc.type = 'sawtooth';
      sirenFilter.type = 'lowpass';
      sirenFilter.frequency.setValueAtTime(1400, now);

      // Create LFO to modulate siren pitch rapidly
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(4.5, now); // 4.5 Hz warble rate
      lfoGain.gain.setValueAtTime(110, now);

      sirenOsc.frequency.setValueAtTime(770, now);
      lfo.connect(sirenOsc.frequency);

      sirenGain.gain.setValueAtTime(0, now);
      sirenGain.gain.linearRampToValueAtTime(0.22, now + 0.15);
      sirenGain.gain.setValueAtTime(0.22, now + 1.8);
      sirenGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

      sirenOsc.connect(sirenFilter);
      sirenFilter.connect(sirenGain);
      sirenGain.connect(ctx.destination);

      lfo.start(now);
      sirenOsc.start(now);
      lfo.stop(now + 2.5);
      sirenOsc.stop(now + 2.5);

      // 2. Sub-Bass Emergency Alert Rumble
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(55, now);
      subOsc.frequency.linearRampToValueAtTime(35, now + 2.0);

      subGain.gain.setValueAtTime(0, now);
      subGain.gain.linearRampToValueAtTime(0.35, now + 0.1);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.3);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 2.4);

      // 3. Crisp End Notification Chimes (at t = 2.4s and 2.6s)
      const chimes = [
        { freq: 1046.5, time: 2.35, dur: 0.18, gain: 0.2 }, // C6
        { freq: 1318.5, time: 2.55, dur: 0.28, gain: 0.22 }, // E6
      ];

      chimes.forEach(({ freq, time, dur, gain }) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + time);

        g.gain.setValueAtTime(0, now + time);
        g.gain.linearRampToValueAtTime(gain, now + time + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now + time);
        osc.stop(now + time + dur + 0.05);
      });
    } catch (err) {
      console.warn('Emergency siren playback interrupted:', err);
    }
  }

  /**
   * WATCH LEVEL SOUND (Soft dual chime)
   */
  public static async playWatch(): Promise<void> {
    if (!this.enabled) return;
    const ctx = await this.getContext();
    if (!ctx || ctx.state !== 'running') return;

    const now = ctx.currentTime;
    const tones = [
      { freq: 523.25, time: 0, dur: 0.14, gain: 0.12 },
      { freq: 659.25, time: 0.18, dur: 0.18, gain: 0.14 },
    ];

    tones.forEach(({ freq, time, dur, gain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);
      gainNode.gain.setValueAtTime(0, now + time);
      gainNode.gain.linearRampToValueAtTime(gain, now + time + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + dur + 0.02);
    });
  }

  /**
   * Main Alert Dispatcher
   */
  public static async playAlert(level: AlertSoundLevel = 'CRITICAL'): Promise<void> {
    if (!this.enabled) return;
    if (level === 'CRITICAL' || level === 'SEVERE') {
      await this.playEmergencySiren();
    } else if (level === 'WATCH' || level === 'WARNING') {
      await this.playWatch();
    }
  }
}
