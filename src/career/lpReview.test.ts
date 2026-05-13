import { describe, expect, it } from 'vitest';
import { buildLpReview, getLpReviewProfile, shouldFireLpReview } from './lpReview';
import type { RunState } from '../game/types';

const baseFundManager: RunState = {
  seed: 1, week: 5, day: 'MON', tier: 'FUND_MANAGER',
  cash: 30000, reputation: 70, xp: 12, marketRegime: 'CALM',
  tickers: [], sharePositions: [], optionPositions: [], isBankrupt: false,
  weekLog: [], weekOptionResults: [],
  fundamentalScore: 0, technicalScore: 0, weekFundamentalScore: 0, weekTechnicalScore: 0,
  stress: 0, confidence: 0, marginUsed: 0, tickerSeries: {},
  weekStartNetWorth: 30000, weekStartCash: 30000, restingOrders: [], clients: [],
  dayStartNetWorth: 30000, dailyLossStrikes: 0, rivals: [],
  lpNetWorthHistory: [28000, 28500, 29000, 29500, 30000]
};

describe('getLpReviewProfile', () => {
  it('returns no profile below Fund Manager', () => {
    expect(getLpReviewProfile('STOCK_BROKER')).toBeUndefined();
    expect(getLpReviewProfile('PROP_DESK_ROOKIE')).toBeUndefined();
  });

  it('returns profiles at Fund Manager and Hedge Fund Founder', () => {
    expect(getLpReviewProfile('FUND_MANAGER')).toBeDefined();
    expect(getLpReviewProfile('HEDGE_FUND_FOUNDER')).toBeDefined();
  });
});

describe('shouldFireLpReview', () => {
  it('fires on Monday of week 5 at Fund Manager', () => {
    expect(shouldFireLpReview(baseFundManager)).toBe(true);
  });

  it('does not fire on non-Mondays', () => {
    expect(shouldFireLpReview({ ...baseFundManager, day: 'WED' })).toBe(false);
  });

  it('does not fire on weeks that are not 1 mod 4 (after week 1)', () => {
    expect(shouldFireLpReview({ ...baseFundManager, week: 6 })).toBe(false);
    expect(shouldFireLpReview({ ...baseFundManager, week: 7 })).toBe(false);
    expect(shouldFireLpReview({ ...baseFundManager, week: 8 })).toBe(false);
  });

  it('does not fire on week 1', () => {
    expect(shouldFireLpReview({ ...baseFundManager, week: 1, lpNetWorthHistory: [30000] })).toBe(false);
  });

  it('does not fire without enough history', () => {
    expect(shouldFireLpReview({ ...baseFundManager, lpNetWorthHistory: [30000, 30500] })).toBe(false);
  });
});

describe('buildLpReview', () => {
  it('reports passed when the 4-week return clears the benchmark', () => {
    // 28000 → 30000 = ~7.1% over 4 weeks. Fund Manager benchmark is 2%.
    const review = buildLpReview(baseFundManager);
    expect(review).toBeDefined();
    expect(review!.passed).toBe(true);
    expect(review!.clientBalanceMultiplier).toBeGreaterThan(0);
    expect(review!.reputationDelta).toBeGreaterThan(0);
  });

  it('reports failed when the 4-week return misses', () => {
    const slipped = { ...baseFundManager, lpNetWorthHistory: [30000, 29800, 29700, 29500, 29500] };
    const review = buildLpReview(slipped);
    expect(review!.passed).toBe(false);
    expect(review!.clientBalanceMultiplier).toBeLessThan(0);
    expect(review!.reputationDelta).toBeLessThan(0);
  });
});
