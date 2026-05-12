export type SfxId =
  | 'click'
  | 'buy'
  | 'sell'
  | 'profit'
  | 'loss'
  | 'expiryItm'
  | 'expiryOtm'
  | 'dayAdvance'
  | 'shock'
  | 'promotion'
  | 'bankruptcy'
  | 'tutorialNext'
  | 'bossReveal';

let cachedContext: AudioContext | null = null;
let muted = false;
let masterVolume = 0.5;

export function setSfxMuted(value: boolean) {
  muted = value;
}

export function isSfxMuted() {
  return muted;
}

export function setSfxVolume(value: number) {
  masterVolume = Math.max(0, Math.min(1, value));
}

export function getSfxVolume() {
  return masterVolume;
}

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!cachedContext) {
    try {
      cachedContext = new Ctor();
    } catch {
      return null;
    }
  }
  if (cachedContext.state === 'suspended') {
    void cachedContext.resume();
  }
  return cachedContext;
}

interface Tone {
  freq: number;
  type?: OscillatorType;
  start: number;
  duration: number;
  gain?: number;
}

function playTones(ctx: AudioContext, tones: Tone[]) {
  const master = ctx.createGain();
  master.gain.value = masterVolume;
  master.connect(ctx.destination);

  const now = ctx.currentTime;
  for (const tone of tones) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = tone.type ?? 'sine';
    osc.frequency.value = tone.freq;

    const startTime = now + tone.start;
    const endTime = startTime + tone.duration;
    const peak = tone.gain ?? 0.6;

    env.gain.setValueAtTime(0.0001, startTime);
    env.gain.exponentialRampToValueAtTime(peak, startTime + Math.min(0.02, tone.duration / 4));
    env.gain.exponentialRampToValueAtTime(0.0001, endTime);

    osc.connect(env);
    env.connect(master);
    osc.start(startTime);
    osc.stop(endTime + 0.02);
  }
}

function playNoiseBurst(ctx: AudioContext, duration: number, gain = 0.4) {
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const env = ctx.createGain();
  env.gain.value = gain * masterVolume;
  source.connect(env);
  env.connect(ctx.destination);
  source.start();
}

export function playSfx(id: SfxId) {
  if (muted) return;
  const ctx = getContext();
  if (!ctx) return;

  switch (id) {
    case 'click':
      playTones(ctx, [{ freq: 720, type: 'triangle', start: 0, duration: 0.05, gain: 0.25 }]);
      break;
    case 'tutorialNext':
      playTones(ctx, [{ freq: 880, type: 'triangle', start: 0, duration: 0.08, gain: 0.3 }]);
      break;
    case 'dayAdvance':
      playTones(ctx, [
        { freq: 540, type: 'sine', start: 0, duration: 0.08, gain: 0.28 },
        { freq: 810, type: 'sine', start: 0.05, duration: 0.08, gain: 0.22 }
      ]);
      break;
    case 'buy':
      playTones(ctx, [
        { freq: 520, type: 'square', start: 0, duration: 0.08, gain: 0.22 },
        { freq: 780, type: 'square', start: 0.07, duration: 0.1, gain: 0.18 }
      ]);
      break;
    case 'sell':
      playTones(ctx, [
        { freq: 940, type: 'square', start: 0, duration: 0.08, gain: 0.22 },
        { freq: 620, type: 'square', start: 0.07, duration: 0.1, gain: 0.18 }
      ]);
      break;
    case 'profit':
      playTones(ctx, [
        { freq: 660, type: 'triangle', start: 0, duration: 0.12, gain: 0.4 },
        { freq: 880, type: 'triangle', start: 0.1, duration: 0.14, gain: 0.4 },
        { freq: 1100, type: 'triangle', start: 0.22, duration: 0.2, gain: 0.36 }
      ]);
      break;
    case 'loss':
      playTones(ctx, [
        { freq: 360, type: 'sawtooth', start: 0, duration: 0.15, gain: 0.3 },
        { freq: 280, type: 'sawtooth', start: 0.12, duration: 0.2, gain: 0.3 }
      ]);
      break;
    case 'expiryItm':
      playTones(ctx, [
        { freq: 780, type: 'sine', start: 0, duration: 0.2, gain: 0.4 },
        { freq: 1170, type: 'sine', start: 0, duration: 0.3, gain: 0.3 },
        { freq: 1560, type: 'sine', start: 0.1, duration: 0.3, gain: 0.25 }
      ]);
      break;
    case 'expiryOtm':
      playTones(ctx, [
        { freq: 160, type: 'sine', start: 0, duration: 0.18, gain: 0.45 },
        { freq: 110, type: 'sine', start: 0.08, duration: 0.25, gain: 0.35 }
      ]);
      break;
    case 'shock':
      playNoiseBurst(ctx, 0.18, 0.35);
      playTones(ctx, [
        { freq: 220, type: 'sawtooth', start: 0, duration: 0.25, gain: 0.4 },
        { freq: 170, type: 'sawtooth', start: 0.18, duration: 0.3, gain: 0.32 }
      ]);
      break;
    case 'bossReveal':
      playTones(ctx, [
        { freq: 130, type: 'sawtooth', start: 0, duration: 0.4, gain: 0.4 },
        { freq: 165, type: 'sawtooth', start: 0.05, duration: 0.4, gain: 0.32 },
        { freq: 196, type: 'sawtooth', start: 0.12, duration: 0.45, gain: 0.28 }
      ]);
      break;
    case 'promotion':
      playTones(ctx, [
        { freq: 523, type: 'triangle', start: 0, duration: 0.18, gain: 0.45 },
        { freq: 659, type: 'triangle', start: 0.16, duration: 0.18, gain: 0.45 },
        { freq: 784, type: 'triangle', start: 0.32, duration: 0.22, gain: 0.45 },
        { freq: 1047, type: 'triangle', start: 0.5, duration: 0.4, gain: 0.4 }
      ]);
      break;
    case 'bankruptcy':
      playTones(ctx, [
        { freq: 220, type: 'sawtooth', start: 0, duration: 0.3, gain: 0.45 },
        { freq: 196, type: 'sawtooth', start: 0.22, duration: 0.3, gain: 0.4 },
        { freq: 165, type: 'sawtooth', start: 0.44, duration: 0.45, gain: 0.4 }
      ]);
      break;
  }
}
