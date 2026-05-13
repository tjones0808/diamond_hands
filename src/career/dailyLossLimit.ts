import type { CareerTier, RunState } from '../game/types';
import { getNetWorth } from '../game/selectors';

/**
 * Daily loss limit only applies at Prop Desk Rookie — the firm has a hard rule. Below the
 * Prop Desk, you trade your own capital with no manager. Above it (Stock Broker and up),
 * you're independent and clients hold you accountable instead.
 */
const DAILY_LIMIT_BY_TIER: Partial<Record<CareerTier, number>> = {
  PROP_DESK_ROOKIE: 1500
};

const MAX_STRIKES = 3;

export function getDailyLossLimit(tier: CareerTier): number | undefined {
  return DAILY_LIMIT_BY_TIER[tier];
}

export interface DailyLossCheckResult {
  run: RunState;
  fired: boolean;
}

/**
 * Called when advancing FROM a day to the next. Compares net worth now to the day's
 * starting net worth. If at Prop Desk and the loss exceeds the limit, applies a strike
 * (reputation hit + log warning). After MAX_STRIKES the player is fired = bankrupt.
 */
export function checkDailyLossLimit(run: RunState): DailyLossCheckResult {
  const limit = getDailyLossLimit(run.tier);
  if (!limit) return { run, fired: false };

  const netWorth = getNetWorth(run);
  const dailyLoss = run.dayStartNetWorth - netWorth;
  if (dailyLoss <= limit) return { run, fired: false };

  const newStrikes = run.dailyLossStrikes + 1;
  const reputation = Math.max(0, run.reputation - 4);
  const log = `Daily loss limit breached (-$${dailyLoss.toFixed(0)} > -$${limit}). Strike ${newStrikes}/${MAX_STRIKES}.`;

  if (newStrikes >= MAX_STRIKES) {
    return {
      run: {
        ...run,
        dailyLossStrikes: newStrikes,
        reputation,
        isBankrupt: true,
        weekLog: [
          ...run.weekLog,
          log,
          'The desk manager pulled your seat. Three strikes — you are out.'
        ]
      },
      fired: true
    };
  }

  return {
    run: {
      ...run,
      dailyLossStrikes: newStrikes,
      reputation,
      weekLog: [...run.weekLog, log, 'A stern note lands on your desk. Tighten up.']
    },
    fired: false
  };
}

/** Resets the day-start anchor — call when starting a new day. */
export function captureDayStartNetWorth(run: RunState): RunState {
  return { ...run, dayStartNetWorth: getNetWorth(run) };
}

export const DAILY_LOSS_MAX_STRIKES = MAX_STRIKES;
