import { describe, expect, it } from 'vitest';
import { getSfxVolume, isSfxMuted, playSfx, setSfxMuted, setSfxVolume } from './audioEngine';

describe('audio engine', () => {
  it('exposes a mute toggle that round-trips', () => {
    setSfxMuted(true);
    expect(isSfxMuted()).toBe(true);
    setSfxMuted(false);
    expect(isSfxMuted()).toBe(false);
  });

  it('clamps volume between 0 and 1', () => {
    setSfxVolume(2);
    expect(getSfxVolume()).toBe(1);
    setSfxVolume(-1);
    expect(getSfxVolume()).toBe(0);
    setSfxVolume(0.42);
    expect(getSfxVolume()).toBe(0.42);
  });

  it('is silent in environments without an AudioContext (jsdom)', () => {
    setSfxMuted(false);
    expect(() => playSfx('click')).not.toThrow();
  });

  it('is a noop when muted', () => {
    setSfxMuted(true);
    expect(() => playSfx('promotion')).not.toThrow();
    setSfxMuted(false);
  });
});
