import { describe, expect, it } from 'vitest';
import type { LifetimeStats, WeekResult } from '../game/types';
import { applyWeekResultToStats, emptyStats, recordBankruptcy } from './runJournal';

function makeResult(overrides: Partial<WeekResult> = {}): WeekResult {
  return {
    week: 1,
    startNetWorth: 5000,
    endNetWorth: 5500,
    netWorthDelta: 500,
    cashDelta: 500,
    optionResults: [],
    optionsTotalPnl: 0,
    reputationDelta: 0,
    xpGained: 1,
    promoted: false,
    lesson: '',
    headline: '',
    ...overrides
  };
}

describe('runJournal stats accumulation', () => {
  it('counts a week and tracks biggest single-week gain', () => {
    const before: LifetimeStats = emptyStats();
    const after = applyWeekResultToStats(before, makeResult({ netWorthDelta: 1200 }));

    expect(after.totalWeeksSurvived).toBe(1);
    expect(after.biggestSingleWeekGain).toBe(1200);
    expect(after.biggestSingleWeekLoss).toBe(0);
  });

  it('tracks biggest single-week loss as a negative number', () => {
    const before: LifetimeStats = emptyStats();
    const after = applyWeekResultToStats(before, makeResult({ netWorthDelta: -800 }));

    expect(after.biggestSingleWeekLoss).toBe(-800);
  });

  it('counts boss-week pass and fail separately', () => {
    const start = emptyStats();
    const passed = applyWeekResultToStats(start, makeResult({
      bossResolution: { passed: true, endNetWorth: 7000, shortfall: 0, reputationDelta: 5, cashDelta: 0, summary: '' }
    }));
    const failed = applyWeekResultToStats(passed, makeResult({
      bossResolution: { passed: false, endNetWorth: 5000, shortfall: 1500, reputationDelta: -3, cashDelta: 0, summary: '' }
    }));

    expect(failed.totalBossWeeksPassed).toBe(1);
    expect(failed.totalBossWeeksFailed).toBe(1);
  });

  it('counts promotions only when the recap reports one', () => {
    const start = emptyStats();
    const next = applyWeekResultToStats(start, makeResult({ promoted: true }));
    expect(next.totalPromotions).toBe(1);
  });
});

describe('recordBankruptcy', () => {
  it('increments the bankruptcy counter', () => {
    const stats = recordBankruptcy(emptyStats());
    expect(stats.totalBankruptcies).toBe(1);
  });
});
