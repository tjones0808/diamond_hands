import { useEffect, useReducer } from 'react';
import { createInitialGameState } from './game/createInitialState';
import { gameReducer } from './game/reducer';
import { Hud } from './ui/Hud';
import { MarketWeekStrip } from './ui/MarketWeekStrip';
import { PostRunSummary } from './ui/PostRunSummary';
import { TradingTerminal } from './ui/TradingTerminal';
import { loadSave, storeSave } from './save/saveGame';
import { RoomCanvas } from './scene/RoomCanvas';
import { MarketTape } from './ui/MarketTape';
import { WeekRecap } from './ui/WeekRecap';
import { Coachmark } from './onboarding/Coachmark';
import { TrophyShelf } from './ui/TrophyShelf';
import { setSfxMuted } from './audio/audioEngine';
import { RunJournal } from './ui/RunJournal';

export function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createInitialGameState(20260508, loadSave()));

  useEffect(() => {
    storeSave(state.save);
  }, [state.save]);

  useEffect(() => {
    setSfxMuted(state.save.audioMuted);
  }, [state.save.audioMuted]);

  return (
    <main className="game-shell">
      <MarketTape run={state.run} save={state.save} dispatch={dispatch} />
      <section className="command-deck" aria-label="Career status cockpit">
        <section className="room-panel" aria-label="Room scene">
          <RoomCanvas run={state.run} save={state.save} />
          <TrophyShelf save={state.save} />
          <RunJournal save={state.save} />
        </section>
        <aside className="status-deck" aria-label="Career and week status">
          <Hud run={state.run} save={state.save} />
          <MarketWeekStrip currentDay={state.run.day} week={state.run.week} />
        </aside>
      </section>
      <section className="terminal-panel" aria-label="Trading terminal">
        <TradingTerminal run={state.run} save={state.save} dispatch={dispatch} />
      </section>
      <WeekRecap run={state.run} dispatch={dispatch} />
      <PostRunSummary run={state.run} onRestart={() => window.location.reload()} />
      <Coachmark run={state.run} save={state.save} onComplete={() => dispatch({ type: 'COMPLETE_TUTORIAL' })} />
    </main>
  );
}
