import { useEffect, useState } from 'react';
import type { SaveState } from '../game/types';
import { tierLabel } from '../content/tierRewards';
import { SettingsPanel } from './SettingsPanel';
import { HallOfFame } from './HallOfFame';
import { AchievementsPanel } from './AchievementsPanel';

export interface TitleScreenProps {
  save: SaveState;
  onStartRun: (seed: number) => void;
  onUpdateSave: (next: SaveState) => void;
}

export function TitleScreen({ save, onStartRun, onUpdateSave }: TitleScreenProps) {
  const [seedInput, setSeedInput] = useState<string>('');
  const [hallOpen, setHallOpen] = useState(false);
  const [achOpen, setAchOpen] = useState(false);
  const [tagline, setTagline] = useState('');

  useEffect(() => {
    const lines = [
      'Trade your way out of the bedroom.',
      'A bad week away from greatness.',
      'Calls go up, puts go down, everything else is a story.',
      'Buy the rumor. Sell the news. Get caught either way.',
      'Friday tells the truth.'
    ];
    setTagline(lines[Math.floor(Math.random() * lines.length)]);
  }, []);

  function startNewRun() {
    const parsed = Number.parseInt(seedInput, 10);
    const seed = Number.isFinite(parsed) && parsed > 0 ? parsed : Math.floor(Math.random() * 1_000_000_000);
    onStartRun(seed);
  }

  function startTutorialRun() {
    onUpdateSave({ ...save, hasCompletedTutorial: false });
    startNewRun();
  }

  const stats = save.stats;

  return (
    <main className="title-screen">
      <div className="title-backdrop" aria-hidden="true" />
      <section className="title-hero">
        <span className="title-eyebrow">Rogue Street · Cash Velocity Desk</span>
        <h1>Career Roguelite Trader</h1>
        <p className="title-tagline">{tagline}</p>
      </section>

      <section className="title-panel">
        <button type="button" className="title-cta" onClick={startNewRun}>
          Start a new run
        </button>
        <div className="title-seed-row">
          <label>
            Seed <small>(optional, share with friends)</small>
            <input
              type="number"
              placeholder="random"
              value={seedInput}
              onChange={(event) => setSeedInput(event.currentTarget.value)}
              min={1}
            />
          </label>
        </div>

        <div className="title-grid">
          <button type="button" className="title-secondary" onClick={() => setHallOpen(true)}>
            🏆 Hall of Fame
            <small>{save.recentRuns.length} runs logged</small>
          </button>
          <button type="button" className="title-secondary" onClick={() => setAchOpen(true)}>
            🎖 Achievements
            <small>{save.achievements.length} unlocked</small>
          </button>
          <button type="button" className="title-secondary" onClick={startTutorialRun}>
            📖 How to play
            <small>Replay the tutorial</small>
          </button>
          <div className="title-secondary settings-host">
            <SettingsPanel
              save={save}
              dispatch={(action) => {
                if (action.type === 'UPDATE_SETTINGS') {
                  onUpdateSave({ ...save, settings: { ...save.settings, ...action.settings } });
                } else if (action.type === 'RESET_TUTORIAL') {
                  onUpdateSave({ ...save, hasCompletedTutorial: false });
                }
              }}
            />
            <small>SFX · Music · A11y</small>
          </div>
        </div>

        <section className="title-stats" aria-label="Lifetime overview">
          <Stat label="Runs played" value={stats.totalRuns.toString()} />
          <Stat label="Weeks survived" value={stats.totalWeeksSurvived.toString()} />
          <Stat label="Highest tier" value={tierLabel(save.highestTier)} />
          <Stat label="Best net worth" value={`$${Math.round(save.bestNetWorth).toLocaleString()}`} />
        </section>
      </section>

      {hallOpen ? <HallOfFame save={save} onClose={() => setHallOpen(false)} /> : null}
      {achOpen ? <AchievementsPanel save={save} onClose={() => setAchOpen(false)} /> : null}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <small>{label}</small>
      <b>{value}</b>
    </span>
  );
}
