import type { CareerTier, RunState } from '../game/types';
import { getDailyMarginRate } from '../career/tierUnlocks';

const leverageByTier: Record<CareerTier, number> = {
  BEDROOM_DAY_TRADER: 1,
  PROP_DESK_ROOKIE: 2,
  STOCK_BROKER: 3,
  FUND_MANAGER: 4,
  HEDGE_FUND_FOUNDER: 5
};

export function getLeverageMultiplier(tier: CareerTier): number {
  return leverageByTier[tier] ?? 1;
}

export function getBuyingPower(run: { cash: number; tier: CareerTier; marginUsed: number }): number {
  const multiplier = getLeverageMultiplier(run.tier);
  // Buying power is the remaining headroom: total credit (cash * multiplier) minus what is already borrowed.
  const totalCredit = Math.max(0, run.cash) * multiplier;
  return Math.max(0, Math.round((totalCredit - run.marginUsed) * 100) / 100);
}

export function accrueMarginInterest(run: RunState): RunState {
  if (run.marginUsed <= 0) return run;
  const rate = getDailyMarginRate(run.tier);
  const interest = Math.round(run.marginUsed * rate * 100) / 100;
  if (interest <= 0) return run;
  return {
    ...run,
    cash: Math.round((run.cash - interest) * 100) / 100,
    weekLog: [...run.weekLog, `Margin interest: -$${interest.toFixed(2)}.`]
  };
}
