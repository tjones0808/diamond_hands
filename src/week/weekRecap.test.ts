import { describe, expect, it } from 'vitest';
import type { OptionResult } from '../game/types';
import { buildWeekResult, groupResultsByStrategy } from './weekRecap';

const callItmResult: OptionResult = {
  symbol: 'NVRA',
  type: 'CALL',
  side: 'LONG',
  strike: 50,
  quantity: 1,
  premiumPaid: 3,
  settlementValue: 8,
  pnl: 5,
  expiredInTheMoney: true,
  expiresDay: 'FRI',
  strategyId: 'call-a',
  strategyType: 'SINGLE_CALL'
};

const putOtmResult: OptionResult = {
  symbol: 'FIZZ',
  type: 'PUT',
  side: 'LONG',
  strike: 25,
  quantity: 2,
  premiumPaid: 4,
  settlementValue: 0,
  pnl: -4,
  expiredInTheMoney: false,
  expiresDay: 'FRI',
  strategyId: 'put-a',
  strategyType: 'SINGLE_PUT'
};

describe('buildWeekResult', () => {
  it('aggregates option P/L into the recap totals', () => {
    const result = buildWeekResult({
      week: 3,
      startNetWorth: 5000,
      endNetWorth: 5200,
      startCash: 4900,
      endCash: 5200,
      optionResults: [callItmResult, putOtmResult],
      reputationDelta: 3,
      xpGained: 2,
      promoted: false
    });

    expect(result.netWorthDelta).toBe(200);
    expect(result.optionResults).toHaveLength(2);
    expect(result.optionsTotalPnl).toBe(1);
  });

  it('produces a headline and lesson that name the winning trade', () => {
    const result = buildWeekResult({
      week: 1,
      startNetWorth: 5000,
      endNetWorth: 6800,
      startCash: 4000,
      endCash: 5800,
      optionResults: [{ ...callItmResult, pnl: 18, settlementValue: 21 }],
      reputationDelta: 3,
      xpGained: 2,
      promoted: false
    });

    expect(result.headline).toMatch(/printed/i);
    expect(result.lesson).toContain('NVRA call paid');
  });

  it('flags a promotion when the gate was cleared this week', () => {
    const result = buildWeekResult({
      week: 4,
      startNetWorth: 5800,
      endNetWorth: 6400,
      startCash: 6400,
      endCash: 6400,
      optionResults: [],
      reputationDelta: 0,
      xpGained: 2,
      promoted: true,
      promotedToTier: 'PROP_DESK_ROOKIE'
    });

    expect(result.promoted).toBe(true);
    expect(result.promotedToTier).toBe('PROP_DESK_ROOKIE');
    expect(result.headline).toMatch(/Promotion/);
    expect(result.lesson).toContain('Promotion gates cleared');
  });

  it('references the Wednesday event in the lesson when one fired', () => {
    const result = buildWeekResult({
      week: 2,
      startNetWorth: 5000,
      endNetWorth: 4400,
      startCash: 5000,
      endCash: 4400,
      optionResults: [],
      event: {
        id: 'short-report',
        title: 'Short Report',
        description: 'brutal thread',
        priceImpact: -0.16,
        volatilityImpact: 0.16,
        reputationImpact: -1,
        symbol: 'NVRA'
      },
      reputationDelta: -1,
      xpGained: 1,
      promoted: false
    });

    expect(result.eventTitle).toBe('Short Report');
    expect(result.lesson.toLowerCase()).toContain('short report');
  });

  it('groups multi-leg results by strategyId and sums their P/L', () => {
    const longLeg: OptionResult = {
      ...callItmResult,
      strategyId: 'spread-1',
      strategyType: 'CALL_SPREAD',
      pnl: 12,
      premiumPaid: 4
    };
    const shortLeg: OptionResult = {
      symbol: 'NVRA',
      type: 'CALL',
      side: 'SHORT',
      strike: 55,
      quantity: 1,
      premiumPaid: 2,
      settlementValue: -7,
      pnl: -5,
      expiredInTheMoney: true,
      expiresDay: 'FRI',
      strategyId: 'spread-1',
      strategyType: 'CALL_SPREAD'
    };

    const groups = groupResultsByStrategy([longLeg, shortLeg]);
    expect(groups).toHaveLength(1);
    expect(groups[0].legs).toHaveLength(2);
    expect(groups[0].totalPnl).toBe(7);
  });
});
