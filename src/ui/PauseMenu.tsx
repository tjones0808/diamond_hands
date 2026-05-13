import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { SaveState } from '../game/types';
import type { GameAction } from '../game/reducer';
import { HallOfFame } from './HallOfFame';
import { AchievementsPanel } from './AchievementsPanel';
import { SettingsPanel } from './SettingsPanel';

interface Props {
  save: SaveState;
  dispatch: (action: GameAction) => void;
  onResume: () => void;
  onQuitToTitle: () => void;
}

export function PauseMenu({ save, dispatch, onResume, onQuitToTitle }: Props) {
  const [hallOpen, setHallOpen] = useState(false);
  const [achOpen, setAchOpen] = useState(false);

  if (typeof document === 'undefined') return null;

  const overlay = (
    <div className="pause-backdrop" role="dialog" aria-modal="true" aria-label="Pause menu">
      <section className="pause-panel">
        <header>
          <span>Paused</span>
          <h2>Take a breath.</h2>
        </header>
        <div className="pause-actions">
          <button type="button" className="pause-primary" onClick={onResume}>Resume run</button>
          <button type="button" onClick={() => setHallOpen(true)}>🏆 Hall of Fame</button>
          <button type="button" onClick={() => setAchOpen(true)}>🎖 Achievements</button>
          <div className="pause-settings-host">
            <SettingsPanel save={save} dispatch={dispatch} />
            <small>SFX · Music · Accessibility</small>
          </div>
          <button type="button" className="pause-quit" onClick={onQuitToTitle}>
            Quit to title
          </button>
        </div>
        <p className="pause-hint">Press <kbd>Esc</kbd> to resume, <kbd>?</kbd> for keyboard shortcuts.</p>
      </section>
      {hallOpen ? <HallOfFame save={save} onClose={() => setHallOpen(false)} /> : null}
      {achOpen ? <AchievementsPanel save={save} onClose={() => setAchOpen(false)} /> : null}
    </div>
  );

  return createPortal(overlay, document.body);
}
