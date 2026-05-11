import { describe, expect, it } from 'vitest';
import { generateMarketWeek } from './marketGenerator';

describe('generateMarketWeek', () => {
  it('creates deterministic tickers for a seed', () => {
    const a = generateMarketWeek(42);
    const b = generateMarketWeek(42);

    expect(a).toEqual(b);
    expect(a.tickers).toHaveLength(8);
    expect(a.tickers[0].prices).toHaveLength(5);
  });

  it('creates positive prices for every day', () => {
    const week = generateMarketWeek(99);

    for (const ticker of week.tickers) {
      for (const point of ticker.prices) {
        expect(point.price).toBeGreaterThan(0);
      }
    }
  });
});
