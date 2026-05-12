import type { CareerTier } from '../game/types';

/**
 * Procedural music engine. Each tier gets its own chord progression, bass line, and
 * melody phrase that loops on the AudioContext. Old name "ambient" preserved for the
 * existing call sites — the API still reads as setAmbient*, but the output is music.
 */

interface MusicProfile {
  tier: CareerTier;
  bpm: number;
  /** 4 chords expressed as MIDI note triads. Each bar = one chord. */
  chords: number[][];
  /** Pool of scale degrees (MIDI) the melody can draw from. */
  scale: number[];
  /** Bass note offsets from each chord's root. */
  bassPattern: number[];
  vibe: string;
}

const profiles: Record<CareerTier, MusicProfile> = {
  BEDROOM_DAY_TRADER: {
    tier: 'BEDROOM_DAY_TRADER',
    bpm: 72,
    chords: [
      [57, 60, 64], // Am
      [53, 57, 60], // F
      [60, 64, 67], // C
      [55, 59, 62]  // G
    ],
    scale: [57, 60, 62, 64, 67, 69, 72, 76],
    bassPattern: [-24, -24, -24, -24],
    vibe: 'Lo-fi bedroom chill'
  },
  PROP_DESK_ROOKIE: {
    tier: 'PROP_DESK_ROOKIE',
    bpm: 92,
    chords: [
      [60, 64, 67], // C
      [57, 60, 64], // Am
      [53, 57, 60], // F
      [55, 59, 62]  // G
    ],
    scale: [60, 62, 64, 65, 67, 69, 71, 72, 76],
    bassPattern: [-24, -24, -24, -24],
    vibe: 'Busy desk groove'
  },
  STOCK_BROKER: {
    tier: 'STOCK_BROKER',
    bpm: 88,
    chords: [
      [62, 65, 69, 72], // Dm7
      [55, 59, 62, 65], // G7
      [60, 64, 67, 71], // Cmaj7
      [57, 60, 64, 67]  // Am7
    ],
    scale: [60, 62, 64, 65, 67, 69, 71, 74, 76, 79],
    bassPattern: [-24, -24, -24, -24],
    vibe: 'Jazz lounge confidence'
  },
  FUND_MANAGER: {
    tier: 'FUND_MANAGER',
    bpm: 84,
    chords: [
      [55, 59, 62], // G
      [52, 55, 59], // Em
      [60, 64, 67], // C
      [62, 66, 69]  // D
    ],
    scale: [55, 57, 59, 60, 62, 64, 66, 67, 71, 74],
    bassPattern: [-24, -24, -24, -24],
    vibe: 'Warm cinematic'
  },
  HEDGE_FUND_FOUNDER: {
    tier: 'HEDGE_FUND_FOUNDER',
    bpm: 96,
    chords: [
      [52, 55, 59], // Em
      [60, 64, 67], // C
      [55, 59, 62], // G
      [62, 66, 69]  // D
    ],
    scale: [52, 55, 57, 59, 60, 62, 64, 67, 71, 74, 76],
    bassPattern: [-24, -24, -36, -24],
    vibe: 'Grand command floor'
  }
};

interface RunningMusic {
  tier: CareerTier;
  ctx: AudioContext;
  master: GainNode;
  scheduled: Array<OscillatorNode | AudioBufferSourceNode>;
  timeoutId: ReturnType<typeof setTimeout> | null;
  cancelled: boolean;
}

let running: RunningMusic | null = null;
let muted = false;
let volume = 0.22; // music sits quietly behind SFX

export function setAmbientMuted(value: boolean) {
  muted = value;
  if (running) {
    running.master.gain.value = muted ? 0 : volume;
  }
}

export function setAmbientVolume(value: number) {
  volume = Math.max(0, Math.min(1, value));
  if (running && !muted) {
    running.master.gain.value = volume;
  }
}

function getOrCreateContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (running) return running.ctx;
  try {
    return new Ctor();
  } catch {
    return null;
  }
}

export function setAmbientTier(tier: CareerTier) {
  if (running?.tier === tier) return;
  const ctx = running?.ctx ?? getOrCreateContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') void ctx.resume();

  stopAmbientInternal();

  const master = ctx.createGain();
  master.gain.value = muted ? 0 : volume;
  master.connect(ctx.destination);

  const instance: RunningMusic = {
    tier,
    ctx,
    master,
    scheduled: [],
    timeoutId: null,
    cancelled: false
  };
  running = instance;

  const profile = profiles[tier];
  const beatDuration = 60 / profile.bpm;
  const beatsPerBar = 4;
  const totalBars = profile.chords.length;
  const loopDuration = beatDuration * beatsPerBar * totalBars;

  const playLoop = () => {
    if (instance.cancelled) return;
    const startTime = ctx.currentTime + 0.05;
    scheduleLoop(ctx, instance, profile, startTime, beatDuration, beatsPerBar);
    instance.timeoutId = setTimeout(playLoop, loopDuration * 1000);
  };

  playLoop();
}

export function stopAmbient() {
  stopAmbientInternal();
}

function stopAmbientInternal() {
  if (!running) return;
  running.cancelled = true;
  if (running.timeoutId) clearTimeout(running.timeoutId);
  const { master, ctx } = running;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
  for (const node of running.scheduled) {
    try {
      if ('stop' in node) node.stop(now + 0.45);
    } catch {
      // ignore
    }
  }
  running = null;
}

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function scheduleLoop(
  ctx: AudioContext,
  instance: RunningMusic,
  profile: MusicProfile,
  startTime: number,
  beatDuration: number,
  beatsPerBar: number
) {
  for (let bar = 0; bar < profile.chords.length; bar += 1) {
    const chord = profile.chords[bar];
    const barTime = startTime + bar * beatsPerBar * beatDuration;
    const barDuration = beatsPerBar * beatDuration;

    // Pad chord — sustained sines for the full bar.
    schedulePad(ctx, instance, chord, barTime, barDuration);

    // Bass — root note + occasional octave drop, hits on beats 1 and 3.
    const bassNote = chord[0] + profile.bassPattern[bar % profile.bassPattern.length];
    scheduleBass(ctx, instance, bassNote, barTime, barDuration / 2);
    scheduleBass(ctx, instance, bassNote, barTime + barDuration / 2, barDuration / 2);

    // Melody — 4 beats per bar with 70% chance of a note per eighth-beat.
    for (let beat = 0; beat < beatsPerBar; beat += 1) {
      for (let sub = 0; sub < 2; sub += 1) {
        if (Math.random() > 0.55) continue;
        const noteTime = barTime + (beat + sub * 0.5) * beatDuration;
        const pool = [...chord, ...profile.scale];
        let note = pool[Math.floor(Math.random() * pool.length)];
        if (Math.random() < 0.25) note += 12; // octave jump
        scheduleMelody(ctx, instance, note, noteTime, beatDuration * 0.6);
      }
    }

    // Soft click on beat 1 every other bar for a sense of pulse.
    if (bar % 2 === 0) {
      scheduleClick(ctx, instance, barTime, 0.04);
    }
  }
}

function schedulePad(ctx: AudioContext, instance: RunningMusic, chord: number[], time: number, duration: number) {
  for (const midi of chord) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = midiToFreq(midi);
    env.gain.setValueAtTime(0.0001, time);
    env.gain.exponentialRampToValueAtTime(0.04, time + duration * 0.35);
    env.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    osc.connect(env);
    env.connect(instance.master);
    osc.start(time);
    osc.stop(time + duration + 0.05);
    instance.scheduled.push(osc);
  }
}

function scheduleBass(ctx: AudioContext, instance: RunningMusic, midi: number, time: number, duration: number) {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = midiToFreq(midi);
  env.gain.setValueAtTime(0.0001, time);
  env.gain.exponentialRampToValueAtTime(0.16, time + 0.04);
  env.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  osc.connect(env);
  env.connect(instance.master);
  osc.start(time);
  osc.stop(time + duration + 0.05);
  instance.scheduled.push(osc);
}

function scheduleMelody(ctx: AudioContext, instance: RunningMusic, midi: number, time: number, duration: number) {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = midiToFreq(midi);
  env.gain.setValueAtTime(0.0001, time);
  env.gain.exponentialRampToValueAtTime(0.09, time + 0.02);
  env.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  osc.connect(env);
  env.connect(instance.master);
  osc.start(time);
  osc.stop(time + duration + 0.05);
  instance.scheduled.push(osc);
}

function scheduleClick(ctx: AudioContext, instance: RunningMusic, time: number, duration: number) {
  // Short noise burst for a percussive tick.
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const env = ctx.createGain();
  env.gain.value = 0.05;
  source.connect(env);
  env.connect(instance.master);
  source.start(time);
  instance.scheduled.push(source);
}
