import { useEffect, useState } from 'react';
import type { GameAction } from '../game/reducer';
import type { GameState } from '../game/types';

interface UseShortcutsProps {
  paused: boolean;
  setPaused: (next: boolean) => void;
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export interface ShortcutsApi {
  helpOpen: boolean;
  setHelpOpen: (next: boolean) => void;
}

export function useKeyboardShortcuts({ paused, setPaused, state, dispatch }: UseShortcutsProps): ShortcutsApi {
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) return;
      }

      if (event.key === '?' || (event.key === '/' && event.shiftKey)) {
        event.preventDefault();
        setHelpOpen(!helpOpen);
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        if (helpOpen) setHelpOpen(false);
        else setPaused(!paused);
        return;
      }

      if (paused || helpOpen) return;

      if (/^[1-9]$/.test(event.key)) {
        const index = Number(event.key) - 1;
        if (index < state.run.tickers.length) {
          event.preventDefault();
          const btn = document.querySelector<HTMLButtonElement>(`.watchlist > button:nth-of-type(${index + 1})`);
          btn?.click();
        }
        return;
      }

      if (event.code === 'Space') {
        event.preventDefault();
        dispatch({ type: 'ADVANCE_DAY' });
        return;
      }

      const key = event.key.toLowerCase();
      if (key === 'm') {
        event.preventDefault();
        dispatch({ type: 'TOGGLE_AUDIO_MUTE' });
      } else if (key === 'j') {
        event.preventDefault();
        document.querySelector<HTMLButtonElement>('.journal-toggle')?.click();
      } else if (key === 'b') {
        event.preventDefault();
        const buyBtn = Array.from(document.querySelectorAll<HTMLButtonElement>('.trade-grid button')).find((b) => /^Buy /i.test(b.textContent ?? ''));
        buyBtn?.click();
      } else if (key === 's') {
        event.preventDefault();
        const sellBtn = Array.from(document.querySelectorAll<HTMLButtonElement>('.trade-grid button')).find((b) => /^Sell /i.test(b.textContent ?? ''));
        sellBtn?.click();
      } else if (key === 'c') {
        event.preventDefault();
        const closeBtn = Array.from(document.querySelectorAll<HTMLButtonElement>('.trade-grid button')).find((b) => /Close Options/i.test(b.textContent ?? ''));
        closeBtn?.click();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [paused, helpOpen, setPaused, state.run.tickers, dispatch]);

  return { helpOpen, setHelpOpen };
}
