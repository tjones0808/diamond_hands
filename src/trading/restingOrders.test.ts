import { describe, expect, it } from 'vitest';
import type { MarketTicker, PricePoint, RunState } from '../game/types';
import { cancelRestingOrder, createRestingOrder, isTriggered, sweepRestingOrders } from './restingOrders';

function makeBar(overrides: Partial<PricePoint> = {}): PricePoint {
  return {
    day: 'MON',
    price: 50,
    open: 50,
    high: 52,
    low: 48,
    close: 50,
    volume: 100_000,
    ...overrides
  };
}

function makeTicker(symbol: string, prices: PricePoint[]): MarketTicker {
  return {
    definition: {
      symbol,
      name: symbol,
      sector: 'TECH',
      basePrice: 50,
      volatility: 0.1,
      quality: 0.5,
      fundamentals: {
        peRatio: 20,
        marketCap: 'MID',
        revenueGrowth: 5,
        dividendYield: 0,
        earningsThisWeek: false,
        narrative: ''
      }
    },
    prices,
    priorHistory: [],
    signal: '',
    snapshot: {
      analystRating: 'HOLD',
      analystTargetPct: 0,
      shortInterestPct: 10,
      fiftyTwoWeekHigh: 60,
      fiftyTwoWeekLow: 40,
      recentHeadlines: []
    }
  };
}

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

describe('isTriggered', () => {
  it('stop loss fires when the day low pierces the trigger', () => {
    expect(isTriggered(
      { id: 'a', type: 'STOP_LOSS', symbol: 'X', triggerPrice: 45, quantity: 1, createdDay: 'MON', createdWeek: 1 },
      makeBar({ low: 44, high: 50, open: 48, close: 47 })
    )).toBe(true);
  });

  it('stop loss does not fire when the day low stays above the trigger', () => {
    expect(isTriggered(
      { id: 'a', type: 'STOP_LOSS', symbol: 'X', triggerPrice: 45, quantity: 1, createdDay: 'MON', createdWeek: 1 },
      makeBar({ low: 46, high: 50, open: 48, close: 49 })
    )).toBe(false);
  });

  it('limit buy fires when the day low reaches the limit', () => {
    expect(isTriggered(
      { id: 'a', type: 'LIMIT_BUY', symbol: 'X', triggerPrice: 48, quantity: 1, createdDay: 'MON', createdWeek: 1 },
      makeBar({ low: 47, high: 51, open: 50, close: 50 })
    )).toBe(true);
  });

  it('limit sell fires when the day high rises through the limit', () => {
    expect(isTriggered(
      { id: 'a', type: 'LIMIT_SELL', symbol: 'X', triggerPrice: 55, quantity: 1, createdDay: 'MON', createdWeek: 1 },
      makeBar({ low: 52, high: 56, open: 53, close: 54 })
    )).toBe(true);
  });
});

describe('createRestingOrder', () => {
  it('adds an order to the run and logs it', () => {
    const next = createRestingOrder(baseRun, 'STOP_LOSS', 'NVRA', 10, 45);
    expect(next.restingOrders).toHaveLength(1);
    expect(next.restingOrders[0]).toMatchObject({ type: 'STOP_LOSS', symbol: 'NVRA', quantity: 10, triggerPrice: 45 });
    expect(next.weekLog.at(-1)).toContain('Stop Loss');
  });
});

describe('cancelRestingOrder', () => {
  it('removes the order and logs it', () => {
    const created = createRestingOrder(baseRun, 'LIMIT_BUY', 'NVRA', 5, 48);
    const orderId = created.restingOrders[0].id;
    const cancelled = cancelRestingOrder(created, orderId);
    expect(cancelled.restingOrders).toHaveLength(0);
    expect(cancelled.weekLog.at(-1)).toContain('Cancelled');
  });
});

describe('sweepRestingOrders', () => {
  it('executes a stop loss when the day low pierces the trigger', () => {
    const ticker = makeTicker('NVRA', [makeBar({ day: 'TUE', low: 44, high: 49, open: 48, close: 47 })]);
    const run: RunState = {
      ...baseRun,
      day: 'TUE',
      sharePositions: [{ symbol: 'NVRA', quantity: 10, averagePrice: 50 }],
      tickers: [ticker],
      restingOrders: [{ id: 'stop1', type: 'STOP_LOSS', symbol: 'NVRA', triggerPrice: 45, quantity: 10, createdDay: 'MON', createdWeek: 1 }]
    };

    const swept = sweepRestingOrders(run, 'TUE');
    expect(swept.sharePositions).toHaveLength(0);
    expect(swept.cash).toBe(5000 + 10 * 45);
    expect(swept.restingOrders).toHaveLength(0);
    expect(swept.weekLog.at(-1)).toContain('Stop Loss triggered');
  });

  it('executes a limit buy when the day low reaches the limit', () => {
    const ticker = makeTicker('NVRA', [makeBar({ day: 'TUE', low: 47, high: 50, open: 49, close: 49 })]);
    const run: RunState = {
      ...baseRun,
      day: 'TUE',
      cash: 1000,
      tickers: [ticker],
      restingOrders: [{ id: 'buy1', type: 'LIMIT_BUY', symbol: 'NVRA', triggerPrice: 48, quantity: 10, createdDay: 'MON', createdWeek: 1 }]
    };

    const swept = sweepRestingOrders(run, 'TUE');
    expect(swept.sharePositions).toHaveLength(1);
    expect(swept.sharePositions[0]).toMatchObject({ symbol: 'NVRA', quantity: 10, averagePrice: 48 });
    expect(swept.cash).toBe(1000 - 480);
    expect(swept.restingOrders).toHaveLength(0);
  });

  it('leaves orders resting when their trigger has not been reached', () => {
    const ticker = makeTicker('NVRA', [makeBar({ day: 'TUE', low: 47, high: 49, open: 48, close: 48 })]);
    const run: RunState = {
      ...baseRun,
      day: 'TUE',
      sharePositions: [{ symbol: 'NVRA', quantity: 10, averagePrice: 50 }],
      tickers: [ticker],
      restingOrders: [{ id: 'stop1', type: 'STOP_LOSS', symbol: 'NVRA', triggerPrice: 40, quantity: 10, createdDay: 'MON', createdWeek: 1 }]
    };

    const swept = sweepRestingOrders(run, 'TUE');
    expect(swept.sharePositions).toHaveLength(1);
    expect(swept.restingOrders).toHaveLength(1);
  });
});
