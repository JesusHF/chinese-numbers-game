/**
 * Web Audio API manager for gapless playback of pre-cached Chinese number WAV files.
 * Supports precise playback rate speed control (0.7x, 1.0x, 1.2x) and rhythmic pauses.
 */

class AudioPlayer {
  private ctx: AudioContext | null = null;
  private bufferCache: Map<string, AudioBuffer> = new Map();
  private activeSources: AudioBufferSourceNode[] = [];
  private isPreloaded: boolean = false;
  private isPlaying: boolean = false;
  private playTimeoutId: number | null = null;

  public async init(): Promise<void> {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    if (!this.isPreloaded) {
      await this.preloadAll();
    }
  }

  public async preloadAll(): Promise<void> {
    try {
      const response = await fetch('/audio/manifest.json');
      const manifest: Array<{ key: string; file: string }> = await response.json();

      await Promise.all(
        manifest.map(async (item) => {
          try {
            const audioRes = await fetch(`/audio/${item.file}`);
            const arrayBuffer = await audioRes.arrayBuffer();
            if (this.ctx) {
              const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
              this.bufferCache.set(item.key, audioBuffer);
            }
          } catch (err) {
            console.warn(`Failed to preload audio for ${item.key}:`, err);
          }
        })
      );
      this.isPreloaded = true;
    } catch (err) {
      console.error('Failed to load audio manifest:', err);
    }
  }

  public stop(): void {
    if (this.playTimeoutId !== null) {
      window.clearTimeout(this.playTimeoutId);
      this.playTimeoutId = null;
    }
    for (const src of this.activeSources) {
      try {
        src.stop();
        src.disconnect();
      } catch {
        // already stopped
      }
    }
    this.activeSources = [];
    this.isPlaying = false;
  }

  /**
   * Plays a sequence of audio tokens gaplessly at the specified speed.
   * Speed affects both the playbackRate of each buffer and the timing interval between buffers.
   */
  public async playTokens(
    tokens: (string | { pause: number })[],
    speed: number = 1.0,
    onEnded?: () => void
  ): Promise<void> {
    await this.init();
    this.stop();

    if (!this.ctx) return;

    this.isPlaying = true;
    let currentTime = this.ctx.currentTime + 0.05; // tiny buffer for audio start

    const standardGapSec = 0.02 / speed; // 20ms gap scaled by speed

    for (const item of tokens) {
      if (typeof item === 'object' && 'pause' in item) {
        currentTime += (item.pause / 1000.0) / speed;
        continue;
      }

      const buffer = this.bufferCache.get(item);
      if (!buffer) {
        console.warn(`Audio buffer missing for token: ${item}`);
        continue;
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = speed;
      source.connect(this.ctx.destination);

      source.start(currentTime);
      this.activeSources.push(source);

      // Duration is buffer.duration divided by playbackRate
      const duration = buffer.duration / speed;
      currentTime += duration + standardGapSec;
    }

    const totalDurationMs = Math.max(0, (currentTime - this.ctx.currentTime) * 1000);
    this.playTimeoutId = window.setTimeout(() => {
      this.isPlaying = false;
      if (onEnded) onEnded();
    }, totalDurationMs);
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const audioPlayer = new AudioPlayer();
