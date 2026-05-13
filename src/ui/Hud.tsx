import type { RunState, SaveState } from '../game/types';
import { getCareerGate } from '../career/careerEngine';
import { getNetWorth } from '../game/selectors';
import { getMoodEffects } from '../career/mood';
import { DAILY_LOSS_MAX_STRIKES, getDailyLossLimit } from '../career/dailyLossLimit';

export function Hud({ run, save }: { run: RunState; save: SaveState }) {
  const gate = getCareerGate(run.tier);
  const mood = getMoodEffects(run);
  const moodTone = mood.label === 'SHARP' || mood.label === 'FOCUSED' ? 'gain' : mood.label === 'TENSE' || mood.label === 'RATTLED' ? 'loss' : '';
  const dailyLimit = getDailyLossLimit(run.tier);
  const dailyLoss = dailyLimit !== undefined ? Math.max(0, run.dayStartNetWorth - getNetWorth(run)) : 0;

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
      {dailyLimit !== undefined ? (
        <div title={`The desk fires you at ${DAILY_LOSS_MAX_STRIKES} strikes. Each strike fires when daily loss exceeds $${dailyLimit}.`}>
          <strong className={dailyLoss > dailyLimit * 0.7 ? 'loss' : ''}>
            -${Math.round(dailyLoss).toLocaleString()} / -${dailyLimit}
          </strong>
          <span>Daily Limit · {run.dailyLossStrikes}/{DAILY_LOSS_MAX_STRIKES}</span>
        </div>
      ) : null}
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
