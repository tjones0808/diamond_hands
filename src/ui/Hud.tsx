import type { RunState, SaveState } from '../game/types';
import { getCareerGate } from '../career/careerEngine';
import { getNetWorth } from '../game/selectors';

export function Hud({ run, save }: { run: RunState; save: SaveState }) {
  const gate = getCareerGate(run.tier);

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
