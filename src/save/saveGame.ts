import type { SaveState } from '../game/types';
import { createInitialSave } from '../game/createInitialState';

const saveKey = 'career-roguelite-trader-save-v1';

export function loadSave(): SaveState {
  const raw = localStorage.getItem(saveKey);
  if (!raw) return createInitialSave();

  try {
    return { ...createInitialSave(), ...JSON.parse(raw) } as SaveState;
  } catch {
    return createInitialSave();
  }
}

export function storeSave(save: SaveState) {
  localStorage.setItem(saveKey, JSON.stringify(save));
}
