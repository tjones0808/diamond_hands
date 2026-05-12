import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { GameAction } from '../game/reducer';
import type { SaveState, SettingsState } from '../game/types';

export function SettingsPanel({ save, dispatch }: { save: SaveState; dispatch: (action: GameAction) => void }) {
  const [open, setOpen] = useState(false);

  function update<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    dispatch({ type: 'UPDATE_SETTINGS', settings: { [key]: value } as Partial<SettingsState> });
  }

  function resetSave() {
    if (typeof window === 'undefined') return;
    if (!window.confirm('Reset all save data? You will lose trophies, lifetime stats, and unlocks. The current run will reload.')) return;
    window.localStorage.removeItem('career-roguelite-trader-save-v1');
    window.location.reload();
  }

  function replayTutorial() {
    dispatch({ type: 'RESET_TUTORIAL' });
    setOpen(false);
  }

  const modal = open ? (
    <div className="settings-backdrop" role="dialog" aria-modal="true" aria-label="Settings" onClick={() => setOpen(false)}>
      <section className="settings-panel" onClick={(event) => event.stopPropagation()}>
        <header>
          <div>
            <span>Settings</span>
            <h2>Audio, motion, accessibility</h2>
          </div>
          <button type="button" aria-label="Close settings" onClick={() => setOpen(false)}>✕</button>
        </header>

        <section className="settings-group" aria-label="Audio">
          <h3>Audio</h3>
          <label className="settings-row">
            <span>SFX volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={save.settings.sfxVolume}
              onChange={(event) => update('sfxVolume', Number(event.currentTarget.value))}
            />
            <output>{Math.round(save.settings.sfxVolume * 100)}%</output>
          </label>
          <label className="settings-row">
            <span>Music volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={save.settings.musicVolume}
              onChange={(event) => update('musicVolume', Number(event.currentTarget.value))}
            />
            <output>{Math.round(save.settings.musicVolume * 100)}%</output>
          </label>
          <p className="settings-hint">Use the 🔊/🔇 button in the market tape to toggle everything at once.</p>
        </section>

        <section className="settings-group" aria-label="Visual">
          <h3>Visual</h3>
          <label className="settings-row toggle">
            <span>Reduced motion <small>Disables the promotion pulse and other large animations.</small></span>
            <input
              type="checkbox"
              checked={save.settings.reducedMotion}
              onChange={(event) => update('reducedMotion', event.currentTarget.checked)}
            />
          </label>
          <label className="settings-row toggle">
            <span>Colorblind palette <small>Swaps green / red for blue / amber accents.</small></span>
            <input
              type="checkbox"
              checked={save.settings.colorBlindPalette}
              onChange={(event) => update('colorBlindPalette', event.currentTarget.checked)}
            />
          </label>
        </section>

        <section className="settings-group" aria-label="Save data">
          <h3>Save</h3>
          <button type="button" className="settings-action" onClick={replayTutorial}>
            Replay tutorial on next run
          </button>
          <button type="button" className="settings-action danger" onClick={resetSave}>
            Reset all save data
          </button>
        </section>
      </section>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        className="settings-toggle"
        aria-label="Open settings"
        onClick={() => setOpen(true)}
      >
        ⚙
      </button>
      {modal && typeof document !== 'undefined' ? createPortal(modal, document.body) : null}
    </>
  );
}
