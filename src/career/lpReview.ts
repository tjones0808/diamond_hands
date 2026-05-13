import type { CareerTier, LpReviewState, RunState } from '../game/types';

const REVIEW_PERIOD_WEEKS = 4;

interface ReviewProfile {
  benchmarkPct: number;
  beatBonusPct: number;   // client balance multiplier on win
  missPenaltyPct: number; // client balance multiplier on miss
  beatRep: number;
  missRep: number;
}

const profileByTier: Partial<Record<CareerTier, ReviewProfile>> = {
  FUND_MANAGER:       { benchmarkPct: 0.02, beatBonusPct: 0.06, missPenaltyPct: -0.04, beatRep: 4, missRep: -5 },
  HEDGE_FUND_FOUNDER: { benchmarkPct: 0.04, beatBonusPct: 0.08, missPenaltyPct: -0.07, beatRep: 6, missRep: -8 }
};

export function getLpReviewProfile(tier: CareerTier): ReviewProfile | undefined {
  return profileByTier[tier];
}

/** True if a quarterly review fires on this Monday for this tier. */
export function shouldFireLpReview(run: RunState): boolean {
  if (run.day !== 'MON') return false;
  if (!getLpReviewProfile(run.tier)) return false;
  if (run.week < REVIEW_PERIOD_WEEKS + 1) return false; // need at least 4 weeks of history
  if (run.lpNetWorthHistory.length < REVIEW_PERIOD_WEEKS + 1) return false;
  // Fire on weeks 5, 9, 13... (every 4 weeks after the first 4).
  return (run.week - 1) % REVIEW_PERIOD_WEEKS === 0 && run.week !== 1;
}

export function buildLpReview(run: RunState): LpReviewState | undefined {
  const profile = getLpReviewProfile(run.tier);
  if (!profile) return undefined;
  const history = run.lpNetWorthHistory;
  if (history.length < REVIEW_PERIOD_WEEKS + 1) return undefined;
  const startIdx = history.length - REVIEW_PERIOD_WEEKS - 1;
  const startNw = history[startIdx];
  const endNw = history[history.length - 1];
  if (startNw <= 0) return undefined;
  const trailingPct = (endNw - startNw) / startNw;
  const passed = trailingPct >= profile.benchmarkPct;
  return {
    trailingPerformancePct: round4(trailingPct),
    benchmarkPct: profile.benchmarkPct,
    passed,
    clientBalanceMultiplier: passed ? profile.beatBonusPct : profile.missPenaltyPct,
    reputationDelta: passed ? profile.beatRep : profile.missRep,
    headline: passed ? 'LPs are happy. New money inbound.' : 'LPs are not happy. Capital is leaving.',
    body: passed
      ? `You beat the ${(profile.benchmarkPct * 100).toFixed(0)}% benchmark with ${(trailingPct * 100).toFixed(2)}% trailing 4-week return. Existing clients top up their accounts by ${(profile.beatBonusPct * 100).toFixed(0)}%.`
      : `You trailed the ${(profile.benchmarkPct * 100).toFixed(0)}% benchmark at ${(trailingPct * 100).toFixed(2)}%. Existing clients pull ${(Math.abs(profile.missPenaltyPct) * 100).toFixed(0)}% of their balances. Reputation suffers.`
  };
}

function round4(value: number) {
  return Math.round(value * 10000) / 10000;
}
