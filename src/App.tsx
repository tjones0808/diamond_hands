import { useEffect, useState } from 'react';
import { Game } from './Game';
import { TitleScreen } from './ui/TitleScreen';
import { loadSave, storeSave } from './save/saveGame';
import type { SaveState } from './game/types';
import { setSfxMuted, setSfxVolume } from './audio/audioEngine';
import { setAmbientMuted, setAmbientVolume } from './audio/ambient';

type AppView = 'title' | 'game';

export function App() {
  const [save, setSave] = useState<SaveState>(() => loadSave());
  const [view, setView] = useState<AppView>('title');
  const [runSeed, setRunSeed] = useState<number | null>(null);

  // Persist any save change made from the title screen back to localStorage.
  useEffect(() => {
    storeSave(save);
  }, [save]);

  // Audio prefs apply on the title screen too (so the music doesn't blast at 100%).
  useEffect(() => {
    setSfxMuted(save.audioMuted);
    setAmbientMuted(save.audioMuted);
    setSfxVolume(save.settings.sfxVolume);
    setAmbientVolume(save.settings.musicVolume);
  }, [save.audioMuted, save.settings.sfxVolume, save.settings.musicVolume]);

  function startRun(seed: number) {
    setRunSeed(seed);
    setView('game');
  }

  function quitToTitle() {
    // Re-read save from localStorage in case the game persisted updates.
    setSave(loadSave());
    setView('title');
  }

  if (view === 'title') {
    return <TitleScreen save={save} onStartRun={startRun} onUpdateSave={setSave} />;
  }

  if (runSeed === null) {
    // Defensive fallback — should never happen, but bounce back to title if it does.
    setView('title');
    return null;
  }

  return <Game seed={runSeed} initialSave={save} onQuitToTitle={quitToTitle} />;
}
