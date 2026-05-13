import { describe, expect, it } from 'vitest';
import type { RunState } from '../game/types';
import { advanceDay } from './weekEngine';

const run: RunState = {
  seed: 3,
  week: 1,
  day: 'MON',
  tier: 'BEDROOM_DAY_TRADER',
  cash: 5000,
  reputation: 40,
  xp: 0,
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

describe('advanceDay', () => {
  it('moves through the market week', () => {
    expect(advanceDay(run).day).toBe('TUE');
    expect(advanceDay({ ...run, day: 'TUE' }).day).toBe('WED');
  });

  it('starts a new week after Friday', () => {
    const next = advanceDay({ ...run, day: 'FRI', week: 1 });

    expect(next.day).toBe('MON');
    expect(next.week).toBe(2);
  });

  it('keeps Friday outcome logs when starting the next week', () => {
    const next = advanceDay({ ...run, day: 'FRI', week: 1, weekLog: ['NVRA CALL expired in the money.'] });

    expect(next.weekLog).toContain('NVRA CALL expired in the money.');
    expect(next.weekLog.at(-1)).toBe('Week 2 begins.');
  });
});
