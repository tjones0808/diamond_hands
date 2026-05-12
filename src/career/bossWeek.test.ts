import { describe, expect, it } from 'vitest';
import type { RunState } from '../game/types';
import { getBossDefinition, isBossEligible, resolveBossWeek } from './bossWeek';

const baseRun: RunState = {
  seed: 1,
  week: 1,
  day: 'MON',
  tier: 'BEDROOM_DAY_TRADER',
  cash: 6500,
  reputation: 45,
  xp: 5,
  marketRegime: 'CALM',
  tickers: [],
  sharePositions: [],
  optionPositions: [],
  isBankrupt: false,
  weekLog: [],
  weekOptionResults: [],
  fundamentalScore: 0,
  technicalScore: 0,
  weekFundamentalScore: 0,
  weekTechnicalScore: 0,
  stress: 0,
  confidence: 0,
  marginUsed: 0,
  tickerSeries: {},
  weekStartNetWorth: 6500,
  weekStartCash: 6500,
  restingOrders: [],
  clients: []
};

describe('boss week eligibility', () => {
  it('triggers when the player meets every gate requirement', () => {
    expect(isBossEligible(baseRun)).toBe(true);
  });

  it('does not trigger when reputation is below the gate', () => {
    expect(isBossEligible({ ...baseRun, reputation: 30 })).toBe(false);
  });

  it('does not trigger when net worth is below the gate', () => {
    expect(isBossEligible({ ...baseRun, cash: 1000 })).toBe(false);
  });

  it('does not trigger at the final tier (no next tier to promote to)', () => {
    expect(isBossEligible({ ...baseRun, tier: 'HEDGE_FUND_FOUNDER' })).toBe(false);
  });
});

describe('boss week resolution', () => {
  it('passes when net worth meets the target', () => {
    const boss = getBossDefinition('BEDROOM_DAY_TRADER')!;
    const result = resolveBossWeek(boss, boss.netWorthTarget + 100);

    expect(result.passed).toBe(true);
    expect(result.shortfall).toBe(0);
    expect(result.reputationDelta).toBeGreaterThan(0);
    expect(result.summary).toMatch(/Passed/);
  });

  it('fails with a shortfall and a penalty when net worth misses', () => {
    const boss = getBossDefinition('PROP_DESK_ROOKIE')!;
    const result = resolveBossWeek(boss, boss.netWorthTarget - 750);

    expect(result.passed).toBe(false);
    expect(result.shortfall).toBe(750);
    expect(result.reputationDelta).toBeLessThan(0);
    expect(result.cashDelta).toBeLessThan(0);
    expect(result.summary).toMatch(/Failed/);
  });
});
