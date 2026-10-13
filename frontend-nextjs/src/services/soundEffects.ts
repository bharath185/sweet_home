// Web Audio API procedural sound synthesizer for PUBG-style walkthrough
class GameSoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private lastFootstepTime: number = 0;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  public playFootstep(isSprinting: boolean = false, isCrouching: boolean = false) {
    if (!this.enabled) return;
    const now = Date.now();
    const minInterval = isSprinting ? 220 : isCrouching ? 550 : 360;
    if (now - this.lastFootstepTime < minInterval) return;
    this.lastFootstepTime = now;

    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isSprinting ? 420 : isCrouching ? 190 : 310, ctx.currentTime);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isSprinting ? 110 : isCrouching ? 55 : 85, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 0.07);

      const vol = isCrouching ? 0.05 : isSprinting ? 0.16 : 0.10;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Ignore if audio policy blocks initial interaction
    }
  }

  public playDoor(isOpen: boolean) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isOpen ? 220 : 160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(isOpen ? 380 : 110, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Audio context error handler
    }
  }
}

export const soundEngine = new GameSoundEngine();
