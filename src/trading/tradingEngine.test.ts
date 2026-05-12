import { describe, expect, it } from 'vitest';
import type { RunState } from '../game/types';
import {
  buyCall,
  buyPut,
  buyShares,
  closeOptionsForSymbol,
  openMultiLegOptions,
  sellShares,
  settleExpiringOptions,
  settleOptions
} from './tradingEngine';

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
  clients: []
};

describe('tradingEngine', () => {
  it('buys shares and reduces cash', () => {
    const run = buyShares(baseRun, 'NVRA', 10, 50);

    expect(run.cash).toBe(4500);
    expect(run.sharePositions).toEqual([{ symbol: 'NVRA', quantity: 10, averagePrice: 50 }]);
  });

  it('buys a call option using premium times quantity times 100 (contract multiplier)', () => {
    // Premium $4.50 per share × 2 contracts × 100 shares per contract = $900 debit
    const run = buyCall(baseRun, 'NVRA', 55, 2, 4.5);

    expect(run.cash).toBe(4100);
    expect(run.optionPositions[0]).toMatchObject({ symbol: 'NVRA', type: 'CALL', strike: 55, quantity: 2 });
  });

  it('settles calls at expiry using the 100x contract multiplier', () => {
    // 1 contract bought for $3 × 100 = $300 debit. Cash: 5000 - 300 = 4700.
    // Final price $62, strike $55, intrinsic $7 × 100 = $700 payout. Cash: 4700 + 700 = 5400.
    const withCall = buyCall(baseRun, 'NVRA', 55, 1, 3);
    const settled = settleOptions(withCall, { NVRA: 62 });

    expect(withCall.cash).toBe(4700);
    expect(settled.cash).toBe(5400);
    expect(settled.optionPositions).toHaveLength(0);
    expect(settled.weekLog.at(-1)).toContain('expired in the money');
  });

  it('sells shares and removes closed positions', () => {
    const withShares = buyShares(baseRun, 'NVRA', 10, 50);
    const sold = sellShares(withShares, 'NVRA', 10, 55);

    expect(sold.cash).toBe(5050);
    expect(sold.sharePositions).toHaveLength(0);
    expect(sold.weekLog.at(-1)).toContain('Sold 10 NVRA shares');
  });

  it('closes options for a selected symbol before expiry', () => {
    const withCall = buyCall(baseRun, 'NVRA', 55, 2, 4);
    const closed = closeOptionsForSymbol(withCall, 'NVRA', 60, 0.1);

    expect(closed.cash).toBeGreaterThan(withCall.cash);
    expect(closed.optionPositions).toHaveLength(0);
    expect(closed.weekLog.at(-1)).toContain('Closed NVRA options');
  });

  it('opens a call spread as net debit and tracks both legs under a strategy id', () => {
    // Long $4 - short $2 = $2 net debit per share × 1 contract × 100 = $200 debit
    const run = openMultiLegOptions(baseRun, {
      strategyType: 'CALL_SPREAD',
      expiresDay: 'FRI',
      legs: [
        { symbol: 'NVRA', type: 'CALL', side: 'LONG', strike: 50, premium: 4, quantity: 1 },
        { symbol: 'NVRA', type: 'CALL', side: 'SHORT', strike: 55, premium: 2, quantity: 1 }
      ]
    });

    expect(run.cash).toBe(4800);
    expect(run.optionPositions).toHaveLength(2);
    expect(run.optionPositions[0].strategyId).toBe(run.optionPositions[1].strategyId);
    expect(run.optionPositions[0].strategyType).toBe('CALL_SPREAD');
    expect(run.weekLog.at(-1)).toContain('CALL SPREAD');
  });

  it('settles a call spread paying spread width minus debit when both legs are deep ITM', () => {
    // $200 debit. ITM: long pays max(0, 70-50)*100 = $2000, short owes max(0, 70-55)*100 = $1500
    // Net settlement: $2000 - $1500 = $500. Cash after: 4800 + 500 = 5300. Total PnL: $500 - $200 = $300
    const run = openMultiLegOptions(baseRun, {
      strategyType: 'CALL_SPREAD',
      expiresDay: 'FRI',
      legs: [
        { symbol: 'NVRA', type: 'CALL', side: 'LONG', strike: 50, premium: 4, quantity: 1 },
        { symbol: 'NVRA', type: 'CALL', side: 'SHORT', strike: 55, premium: 2, quantity: 1 }
      ]
    });
    const settled = settleOptions(run, { NVRA: 70 });

    expect(settled.cash).toBe(5300);
    expect(settled.weekOptionResults).toHaveLength(2);
    const totalPnl = settled.weekOptionResults.reduce((total, item) => total + item.pnl, 0);
    expect(totalPnl).toBeCloseTo(300, 2);
  });

  it('settles only options matching a given expiry day', () => {
    const withTuesday = buyCall(baseRun, 'NVRA', 50, 1, 2, 'TUE');
    const withFriday = buyPut(withTuesday, 'FIZZ', 30, 1, 1.5, 'FRI');
    const settled = settleExpiringOptions(withFriday, 'TUE', { NVRA: 60, FIZZ: 30 });

    expect(settled.optionPositions).toHaveLength(1);
    expect(settled.optionPositions[0].symbol).toBe('FIZZ');
    expect(settled.weekOptionResults).toHaveLength(1);
    expect(settled.weekOptionResults[0].expiresDay).toBe('TUE');
  });

  it('settles a straddle profitably on a large move in either direction', () => {
    const run = openMultiLegOptions(baseRun, {
      strategyType: 'STRADDLE',
      expiresDay: 'FRI',
      legs: [
        { symbol: 'NVRA', type: 'CALL', side: 'LONG', strike: 50, premium: 3, quantity: 1 },
        { symbol: 'NVRA', type: 'PUT', side: 'LONG', strike: 50, premium: 3, quantity: 1 }
      ]
    });
    const upMove = settleOptions(run, { NVRA: 65 });
    const downMove = settleOptions(run, { NVRA: 35 });

    expect(upMove.cash).toBeGreaterThan(run.cash);
    expect(downMove.cash).toBeGreaterThan(run.cash);
    expect(upMove.weekOptionResults).toHaveLength(2);
    expect(downMove.weekOptionResults).toHaveLength(2);
  });
});
