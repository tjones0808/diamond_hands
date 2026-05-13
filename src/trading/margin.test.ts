import { describe, expect, it } from 'vitest';
import { accrueMarginInterest, getBuyingPower, getLeverageMultiplier } from './margin';
import type { RunState } from '../game/types';

const baseRun: RunState = {
  seed: 1,
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
  rivals: [],
  lpNetWorthHistory: []
};

describe('leverage multiplier', () => {
  it('is 1x at Bedroom Day Trader and 5x at Hedge Fund Founder', () => {
    expect(getLeverageMultiplier('BEDROOM_DAY_TRADER')).toBe(1);
    expect(getLeverageMultiplier('HEDGE_FUND_FOUNDER')).toBe(5);
  });
});

describe('getBuyingPower', () => {
  it('matches cash exactly at the bedroom tier', () => {
    expect(getBuyingPower({ cash: 5000, tier: 'BEDROOM_DAY_TRADER', marginUsed: 0 })).toBe(5000);
  });

  it('doubles at Prop Desk Rookie when no margin is used', () => {
    expect(getBuyingPower({ cash: 5000, tier: 'PROP_DESK_ROOKIE', marginUsed: 0 })).toBe(10000);
  });

  it('subtracts already-used margin from buying power', () => {
    expect(getBuyingPower({ cash: 5000, tier: 'PROP_DESK_ROOKIE', marginUsed: 3000 })).toBe(7000);
  });

  it('never goes negative', () => {
    expect(getBuyingPower({ cash: 100, tier: 'BEDROOM_DAY_TRADER', marginUsed: 9000 })).toBe(0);
  });
});

describe('accrueMarginInterest', () => {
  it('is a noop when no margin is used', () => {
    const next = accrueMarginInterest(baseRun);
    expect(next).toBe(baseRun);
  });

  it('charges 0.1% daily on outstanding margin', () => {
    const next = accrueMarginInterest({ ...baseRun, marginUsed: 2000 });
    expect(next.cash).toBe(5000 - 2);
    expect(next.weekLog.at(-1)).toContain('Margin interest');
  });
});
