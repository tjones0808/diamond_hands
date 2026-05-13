import { describe, expect, it, vi } from 'vitest';
import { flushGameEffects } from './effects';

const effectMocks = vi.hoisted(() => ({
  playSfx: vi.fn(),
  pushToast: vi.fn()
}));

vi.mock('../audio/audioEngine', async (importOriginal) => ({
  ...await importOriginal<typeof import('../audio/audioEngine')>(),
  playSfx: effectMocks.playSfx
}));

vi.mock('../ui/toasts', async (importOriginal) => ({
  ...await importOriginal<typeof import('../ui/toasts')>(),
  pushToast: effectMocks.pushToast
}));

describe('flushGameEffects', () => {
  it('dispatches queued sound and toast effects to the UI modules', () => {
    flushGameEffects([
      { type: 'SFX', id: 'buy' },
      { type: 'TOAST', message: 'Boss week incoming.', tone: 'warn', ttlMs: 5000 }
    ]);

    expect(effectMocks.playSfx).toHaveBeenCalledWith('buy');
    expect(effectMocks.pushToast).toHaveBeenCalledWith('Boss week incoming.', 'warn', 5000);
  });
});
