import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialSave } from '../game/createInitialState';
import { loadSave, saveKey } from './saveGame';

describe('loadSave', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('deep merges nested save data with current defaults', () => {
    window.localStorage.setItem(
      saveKey,
      JSON.stringify({
        unlocks: { secondMonitor: true },
        settings: { sfxVolume: 0.2 },
        stats: { totalRuns: 7 },
        bestNetWorth: 12345
      })
    );

    const defaults = createInitialSave();
    const save = loadSave();

    expect(save.bestNetWorth).toBe(12345);
    expect(save.unlocks).toEqual({
      ...defaults.unlocks,
      secondMonitor: true
    });
    expect(save.settings).toEqual({
      ...defaults.settings,
      sfxVolume: 0.2
    });
    expect(save.stats).toEqual({
      ...defaults.stats,
      totalRuns: 7
    });
  });

  it('falls back to defaults when stored nested values have the wrong shape', () => {
    window.localStorage.setItem(
      saveKey,
      JSON.stringify({
        unlocks: null,
        settings: 'loud',
        stats: 42,
        recentRuns: 'none',
        achievements: {},
        topRuns: false
      })
    );

    const save = loadSave();
    const defaults = createInitialSave();

    expect(save.unlocks).toEqual(defaults.unlocks);
    expect(save.settings).toEqual(defaults.settings);
    expect(save.stats).toEqual(defaults.stats);
    expect(save.recentRuns).toEqual([]);
    expect(save.achievements).toEqual([]);
    expect(save.topRuns).toEqual([]);
  });
});
