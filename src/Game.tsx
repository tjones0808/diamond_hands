import { useEffect, useReducer, useRef, useState } from 'react';
import { createInitialGameState } from './game/createInitialState';
import { gameReducer } from './game/reducer';
import { Hud } from './ui/Hud';
import { MarketWeekStrip } from './ui/MarketWeekStrip';
import { PostRunSummary } from './ui/PostRunSummary';
import { TradingTerminal } from './ui/TradingTerminal';
import { storeSave } from './save/saveGame';
import { RoomCanvas } from './scene/RoomCanvas';
import { MarketTape } from './ui/MarketTape';
import { WeekRecap } from './ui/WeekRecap';
import { Coachmark } from './onboarding/Coachmark';
import { TrophyShelf } from './ui/TrophyShelf';
import { setSfxMuted, setSfxVolume } from './audio/audioEngine';
import { setAmbientMuted, setAmbientTier, setAmbientVolume, stopAmbient } from './audio/ambient';
import { RunJournal } from './ui/RunJournal';
import { InsiderTipModal, SecInvestigationModal } from './ui/InsiderTipModal';
import { LpReviewModal } from './ui/LpReviewModal';
import { PauseMenu } from './ui/PauseMenu';
import { useKeyboardShortcuts } from './ui/useKeyboardShortcuts';
import { ShortcutHelp } from './ui/ShortcutHelp';
import { ToastStack } from './ui/ToastStack';
import type { SaveState } from './game/types';
import { flushGameEffects } from './game/effects';

export interface GameProps {
  seed: number;
  initialSave: SaveState;
  onQuitToTitle: () => void;
}

export function Game({ seed, initialSave, onQuitToTitle }: GameProps) {
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    () => createInitialGameState(seed, initialSave)
  );
  const [paused, setPaused] = useState(false);
  const watchlistRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    storeSave(state.save);
  }, [state.save]);

  useEffect(() => {
    if (state.effects.length === 0) return;
    flushGameEffects(state.effects);
    dispatch({ type: 'CLEAR_EFFECTS' });
  }, [state.effects]);

  useEffect(() => {
    setSfxMuted(state.save.audioMuted);
    setAmbientMuted(state.save.audioMuted);
  }, [state.save.audioMuted]);

  useEffect(() => {
    setSfxVolume(state.save.settings.sfxVolume);
    setAmbientVolume(state.save.settings.musicVolume);
  }, [state.save.settings.sfxVolume, state.save.settings.musicVolume]);

  useEffect(() => {
    setAmbientTier(state.run.tier);
    return () => {
      stopAmbient();
    };
  }, [state.run.tier]);

  const { helpOpen, setHelpOpen } = useKeyboardShortcuts({
    paused,
    setPaused,
    state,
    dispatch
  });

  const shellClasses = ['game-shell'];
  if (state.save.settings.reducedMotion) shellClasses.push('reduced-motion');
  if (state.save.settings.colorBlindPalette) shellClasses.push('colorblind');

  return (
    <main className={shellClasses.join(' ')}>
      <MarketTape run={state.run} save={state.save} dispatch={dispatch} />
      <section className="command-deck" aria-label="Career status cockpit">
        <section className="room-panel" aria-label="Room scene">
          <RoomCanvas run={state.run} save={state.save} />
          <TrophyShelf save={state.save} />
          <RunJournal save={state.save} run={state.run} />
        </section>
        <aside className="status-deck" aria-label="Career and week status">
          <Hud run={state.run} save={state.save} />
          <MarketWeekStrip currentDay={state.run.day} week={state.run.week} />
        </aside>
      </section>
      <section className="terminal-panel" aria-label="Trading terminal" ref={watchlistRef as never}>
        <TradingTerminal run={state.run} save={state.save} dispatch={dispatch} />
      </section>
      <InsiderTipModal run={state.run} dispatch={dispatch} />
      <SecInvestigationModal run={state.run} dispatch={dispatch} />
      <LpReviewModal run={state.run} dispatch={dispatch} />
      <WeekRecap run={state.run} dispatch={dispatch} />
      <PostRunSummary run={state.run} onRestart={onQuitToTitle} />
      <Coachmark run={state.run} save={state.save} onComplete={() => dispatch({ type: 'COMPLETE_TUTORIAL' })} />
      {paused ? (
        <PauseMenu
          save={state.save}
          dispatch={dispatch}
          onResume={() => setPaused(false)}
          onQuitToTitle={onQuitToTitle}
        />
      ) : null}
      <ShortcutHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
      <ToastStack />
    </main>
  );
}
