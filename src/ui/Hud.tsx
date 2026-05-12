import type { RunState, SaveState } from '../game/types';
import { getCareerGate } from '../career/careerEngine';
import { getNetWorth } from '../game/selectors';
import { getMoodEffects } from '../career/mood';

export function Hud({ run, save }: { run: RunState; save: SaveState }) {
  const gate = getCareerGate(run.tier);
  const mood = getMoodEffects(run);
  const moodTone = mood.label === 'SHARP' || mood.label === 'FOCUSED' ? 'gain' : mood.label === 'TENSE' || mood.label === 'RATTLED' ? 'loss' : '';

  return (
    <header className="hud" aria-label="Run status">
      <div>
        <strong>{gate.title}</strong>
        <span>Career</span>
      </div>
      <div>
        <strong>${Math.round(run.cash).toLocaleString()}</strong>
        <span>Cash</span>
      </div>
      <div>
        <strong>${Math.round(getNetWorth(run)).toLocaleString()}</strong>
        <span>Net worth</span>
      </div>
      <div>
        <strong>{run.reputation}</strong>
        <span>Reputation</span>
      </div>
      <div>
        <strong>{run.xp}</strong>
        <span>XP</span>
      </div>
      <div title={mood.description}>
        <strong className={moodTone}>{mood.label}</strong>
        <span>Mood</span>
      </div>
      <div>
        <strong>{run.marketRegime.replaceAll('_', ' ')}</strong>
        <span>Regime</span>
      </div>
      <div>
        <strong>${Math.round(save.bestNetWorth).toLocaleString()}</strong>
        <span>Best run</span>
      </div>
    </header>
  );
}
