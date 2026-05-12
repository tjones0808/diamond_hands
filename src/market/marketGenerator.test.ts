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

  it('produces OHLC where high >= max(open,close) and low <= min(open,close)', () => {
    const week = generateMarketWeek(2026);

    for (const ticker of week.tickers) {
      for (const point of ticker.prices) {
        expect(point.high).toBeGreaterThanOrEqual(Math.max(point.open, point.close));
        expect(point.low).toBeLessThanOrEqual(Math.min(point.open, point.close));
        expect(point.volume).toBeGreaterThan(0);
      }
    }
  });

  it('attaches 15 bars of prior history that lead into the current Monday open', () => {
    const week = generateMarketWeek(2026);

    for (const ticker of week.tickers) {
      expect(ticker.priorHistory).toHaveLength(15);
      const lastHistorical = ticker.priorHistory.at(-1);
      const firstCurrent = ticker.prices[0];
      expect(lastHistorical?.close).toBeCloseTo(firstCurrent.open, 1);
    }
  });

  it('builds a snapshot with analyst rating, short interest, 52w range, and 3 headlines', () => {
    const week = generateMarketWeek(2026);

    for (const ticker of week.tickers) {
      expect(['STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL']).toContain(ticker.snapshot.analystRating);
      expect(ticker.snapshot.shortInterestPct).toBeGreaterThan(0);
      expect(ticker.snapshot.fiftyTwoWeekHigh).toBeGreaterThanOrEqual(ticker.snapshot.fiftyTwoWeekLow);
      expect(ticker.snapshot.recentHeadlines).toHaveLength(3);
    }
  });
});
