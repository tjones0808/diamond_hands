import { describe, expect, it } from 'vitest';
import type { PricePoint } from '../game/types';
import { computeTechnicals } from './technicals';

const week: PricePoint[] = [
  { day: 'MON', open: 50, high: 52, low: 49, close: 51, price: 51, volume: 200_000 },
  { day: 'TUE', open: 51, high: 54, low: 50, close: 53, price: 53, volume: 250_000 },
  { day: 'WED', open: 53, high: 55, low: 51, close: 54, price: 54, volume: 320_000 },
  { day: 'THU', open: 54, high: 57, low: 53, close: 56, price: 56, volume: 280_000 },
  { day: 'FRI', open: 56, high: 58, low: 55, close: 57, price: 57, volume: 240_000 }
];

describe('computeTechnicals', () => {
  it('reports an uptrend when prices climb steadily', () => {
    const t = computeTechnicals(week, 'FRI');
    expect(t.trend).toBe('UP');
    expect(t.momentumPct).toBeGreaterThan(10);
    expect(t.support).toBe(49);
    expect(t.resistance).toBe(58);
  });

  it('only uses days at or before the current day', () => {
    const t = computeTechnicals(week, 'TUE');
    expect(t.pricesSoFar).toBe(2);
    expect(t.resistance).toBe(54); // only MON + TUE highs counted
  });

  it('reports a downtrend when prices drop', () => {
    const drop = week.map((point) => ({ ...point, close: point.close - 8, open: point.open - 6, high: point.high - 5, low: point.low - 9, price: point.close - 8 }));
    drop[0].close = 60;
    drop[0].price = 60;
    drop[4].close = 48;
    drop[4].price = 48;
    const t = computeTechnicals(drop, 'FRI');
    expect(t.trend).toBe('DOWN');
  });

  it('computes a sensible RSI bounded between 0 and 100', () => {
    const t = computeTechnicals(week, 'FRI');
    expect(t.rsi).toBeGreaterThanOrEqual(0);
    expect(t.rsi).toBeLessThanOrEqual(100);
    expect(t.rsi).toBeGreaterThan(60); // bullish bars
  });
});
