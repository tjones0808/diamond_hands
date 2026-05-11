import { describe, expect, it } from 'vitest';
import type { RunState } from '../game/types';
import { buyCall, buyShares, closeOptionsForSymbol, sellShares, settleOptions } from './tradingEngine';

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
  weekLog: []
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
});
