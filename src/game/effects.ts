import { playSfx } from '../audio/audioEngine';
import { pushToast } from '../ui/toasts';
import type { GameEffect } from './types';

export function flushGameEffects(effects: GameEffect[]) {
  for (const effect of effects) {
    if (effect.type === 'SFX') {
      playSfx(effect.id);
      continue;
    }

    pushToast(effect.message, effect.tone, effect.ttlMs);
  }
}
