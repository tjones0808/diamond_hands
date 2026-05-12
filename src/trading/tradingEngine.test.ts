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
  technicalScore: 0
};

describe('tradingEngine', () => {
  it('buys shares and reduces cash', () => {
    const run = buyShares(baseRun, 'NVRA', 10, 50);

    expect(run.cash).toBe(4500);
    expect(run.sharePositions).toEqual([{ symbol: 'NVRA', quantity: 10, averagePrice: 50 }]);
  });

  it('buys a call option using premium times quantity', () => {
    const run = buyCall(baseRun, 'NVRA', 55, 2, 4.5);

    expect(run.cash).toBe(4991);
    expect(run.optionPositions[0]).toMatchObject({ symbol: 'NVRA', type: 'CALL', strike: 55, quantity: 2 });
  });

  it('settles calls at expiry', () => {
    const withCall = buyCall(baseRun, 'NVRA', 55, 1, 3);
    const settled = settleOptions(withCall, { NVRA: 62 });

    expect(settled.cash).toBe(5004);
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
    const run = openMultiLegOptions(baseRun, {
      strategyType: 'CALL_SPREAD',
      expiresDay: 'FRI',
      legs: [
        { symbol: 'NVRA', type: 'CALL', side: 'LONG', strike: 50, premium: 4, quantity: 1 },
        { symbol: 'NVRA', type: 'CALL', side: 'SHORT', strike: 55, premium: 2, quantity: 1 }
      ]
    });

    expect(run.cash).toBe(4998);
    expect(run.optionPositions).toHaveLength(2);
    expect(run.optionPositions[0].strategyId).toBe(run.optionPositions[1].strategyId);
    expect(run.optionPositions[0].strategyType).toBe('CALL_SPREAD');
    expect(run.weekLog.at(-1)).toContain('CALL SPREAD');
  });

  it('settles a call spread paying spread width minus debit when both legs are deep ITM', () => {
    const run = openMultiLegOptions(baseRun, {
      strategyType: 'CALL_SPREAD',
      expiresDay: 'FRI',
      legs: [
        { symbol: 'NVRA', type: 'CALL', side: 'LONG', strike: 50, premium: 4, quantity: 1 },
        { symbol: 'NVRA', type: 'CALL', side: 'SHORT', strike: 55, premium: 2, quantity: 1 }
      ]
    });
    const settled = settleOptions(run, { NVRA: 70 });

    expect(settled.cash).toBe(5003);
    expect(settled.weekOptionResults).toHaveLength(2);
    const totalPnl = settled.weekOptionResults.reduce((total, item) => total + item.pnl, 0);
    expect(totalPnl).toBeCloseTo(3, 2);
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
