import type { SaveState } from '../game/types';
import { createInitialSave } from '../game/createInitialState';

export const saveKey = 'career-roguelite-trader-save-v1';

export function loadSave(): SaveState {
  const raw = localStorage.getItem(saveKey);
  if (!raw) return createInitialSave();

  try {
    return hydrateSave(JSON.parse(raw));
  } catch {
    return createInitialSave();
  }
}

export function storeSave(save: SaveState) {
  localStorage.setItem(saveKey, JSON.stringify(save));
}

export function hydrateSave(raw: unknown): SaveState {
  const defaults = createInitialSave();
  if (!isRecord(raw)) return defaults;

  return {
    ...defaults,
    ...raw,
    unlocks: {
      ...defaults.unlocks,
      ...(isRecord(raw.unlocks) ? raw.unlocks : {})
    },
    settings: {
      ...defaults.settings,
      ...(isRecord(raw.settings) ? raw.settings : {})
    },
    stats: {
      ...defaults.stats,
      ...(isRecord(raw.stats) ? raw.stats : {})
    },
    tiersEverReached: Array.isArray(raw.tiersEverReached) ? raw.tiersEverReached : defaults.tiersEverReached,
    recentRuns: Array.isArray(raw.recentRuns) ? raw.recentRuns : defaults.recentRuns,
    achievements: Array.isArray(raw.achievements) ? raw.achievements : defaults.achievements,
    topRuns: Array.isArray(raw.topRuns) ? raw.topRuns : defaults.topRuns
  } as SaveState;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
