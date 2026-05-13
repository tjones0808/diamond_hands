import { describe, expect, it } from 'vitest';
import type { RunState } from '../game/types';
import { captureDayStartNetWorth, checkDailyLossLimit, DAILY_LOSS_MAX_STRIKES, getDailyLossLimit } from './dailyLossLimit';

const baseRun: RunState = {
  seed: 1,
  week: 1,
  day: 'MON',
  tier: 'PROP_DESK_ROOKIE',
  cash: 5000,
  reputation: 60,
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
  weekStartNetWorth: 5000,
  weekStartCash: 5000,
  restingOrders: [],
  clients: [],
  dayStartNetWorth: 5000,
  dailyLossStrikes: 0,
  rivals: []
};

describe('getDailyLossLimit', () => {
  it('only applies at Prop Desk Rookie', () => {
    expect(getDailyLossLimit('BEDROOM_DAY_TRADER')).toBeUndefined();
    expect(getDailyLossLimit('PROP_DESK_ROOKIE')).toBe(1500);
    expect(getDailyLossLimit('STOCK_BROKER')).toBeUndefined();
    expect(getDailyLossLimit('FUND_MANAGER')).toBeUndefined();
  });
});

describe('checkDailyLossLimit', () => {
  it('is a noop when the player is not at the prop desk', () => {
    const result = checkDailyLossLimit({ ...baseRun, tier: 'BEDROOM_DAY_TRADER', cash: 1000 });
    expect(result.fired).toBe(false);
    expect(result.run.dailyLossStrikes).toBe(0);
  });

  it('does not strike when the loss is within the limit', () => {
    const result = checkDailyLossLimit({ ...baseRun, cash: 4000 }); // -$1000 < $1500
    expect(result.fired).toBe(false);
    expect(result.run.dailyLossStrikes).toBe(0);
  });

  it('adds a strike and hits reputation on a breach', () => {
    const result = checkDailyLossLimit({ ...baseRun, cash: 2000 }); // -$3000 > $1500
    expect(result.fired).toBe(false);
    expect(result.run.dailyLossStrikes).toBe(1);
    expect(result.run.reputation).toBe(56);
    expect(result.run.weekLog.at(-1)).toContain('Tighten up');
  });

  it('fires the player after three strikes', () => {
    const result = checkDailyLossLimit({ ...baseRun, cash: 2000, dailyLossStrikes: 2 });
    expect(result.fired).toBe(true);
    expect(result.run.isBankrupt).toBe(true);
    expect(result.run.dailyLossStrikes).toBe(DAILY_LOSS_MAX_STRIKES);
  });
});

describe('captureDayStartNetWorth', () => {
  it('snapshots current net worth as the day-start baseline', () => {
    const snapped = captureDayStartNetWorth({ ...baseRun, cash: 7200 });
    expect(snapped.dayStartNetWorth).toBe(7200);
  });
});
