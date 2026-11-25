/**
 * Web Audio API manager for gapless playback of pre-cached Chinese number WAV files.
 * Supports multiple natural neural voices ('xiaoxiao' & 'yunxi') and speed rates (0.7x, 1.0x, 1.2x).
 */

import { VoiceId } from '../types/game';

class AudioPlayer {
  private ctx: AudioContext | null = null;
  // Caches per voice: voiceId -> (tokenKey -> AudioBuffer)
  private voiceCaches: Map<VoiceId, Map<string, AudioBuffer>> = new Map();
  private preloadedVoices: Set<VoiceId> = new Set();
  private activeSources: AudioBufferSourceNode[] = [];
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
  }

  public async preloadVoice(voiceId: VoiceId): Promise<void> {
    if (this.preloadedVoices.has(voiceId)) return;
    await this.init();

    try {
      const response = await fetch(`/audio/${voiceId}/manifest.json`);
      const manifest: Array<{ key: string; file: string }> = await response.json();

      let cache = this.voiceCaches.get(voiceId);
      if (!cache) {
        cache = new Map();
        this.voiceCaches.set(voiceId, cache);
      }

      await Promise.all(
        manifest.map(async (item) => {
          try {
            const audioRes = await fetch(`/audio/${voiceId}/${item.file}`);
            const arrayBuffer = await audioRes.arrayBuffer();
            if (this.ctx) {
              const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
              cache!.set(item.key, audioBuffer);
            }
          } catch (err) {
            console.warn(`Failed to preload ${voiceId}/${item.key}:`, err);
          }
        })
      );
      this.preloadedVoices.add(voiceId);
    } catch (err) {
      console.error(`Failed to load manifest for voice ${voiceId}:`, err);
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

  public async playTokens(
    tokens: (string | { pause: number })[],
    speed: number = 1.0,
    voiceId: VoiceId = 'xiaoxiao',
    onEnded?: () => void
  ): Promise<void> {
    await this.preloadVoice(voiceId);
    this.stop();

    if (!this.ctx) return;

    const cache = this.voiceCaches.get(voiceId);
    if (!cache) return;

    this.isPlaying = true;
    let currentTime = this.ctx.currentTime + 0.05;
    const standardGapSec = 0.02 / speed;

    for (const item of tokens) {
      if (typeof item === 'object' && 'pause' in item) {
        currentTime += (item.pause / 1000.0) / speed;
        continue;
      }

      const buffer = cache.get(item);
      if (!buffer) {
        console.warn(`Audio buffer missing for ${voiceId}/${item}`);
        continue;
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = speed;
      source.connect(this.ctx.destination);

      source.start(currentTime);
      this.activeSources.push(source);

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
