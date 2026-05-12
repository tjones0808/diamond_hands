import type { MarketRegime, MarketTicker, PricePoint, WeekDay } from '../game/types';
import { tickerDefinitions } from '../content/tickers';
import { createRng } from '../simulation/rng';

const weekDays: WeekDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const regimes: MarketRegime[] = ['CALM', 'EARNINGS_STORM', 'FED_WEEK', 'CRASH_WATCH', 'MELT_UP', 'MEME_MANIA'];

const regimeBias: Record<MarketRegime, number> = {
  CALM: 0.002,
  EARNINGS_STORM: 0.006,
  FED_WEEK: -0.002,
  CRASH_WATCH: -0.014,
  MELT_UP: 0.018,
  MEME_MANIA: 0.011
};

export interface GeneratedMarketWeek {
  regime: MarketRegime;
  tickers: MarketTicker[];
}

export function generateMarketWeek(seed: number): GeneratedMarketWeek {
  const rng = createRng(seed);
  const regime = rng.pick(regimes);
  const shuffled = [...tickerDefinitions].sort(() => rng.next() - 0.5);
  const selected = shuffled.slice(0, 8);

  return {
    regime,
    tickers: selected.map((definition) => {
      let lastClose = definition.basePrice;
      const prices: PricePoint[] = weekDays.map((day) => {
        const drift = regimeBias[regime] + (definition.quality - 0.5) * 0.01;
        const noise = rng.float(-definition.volatility, definition.volatility);
        const close = Math.max(1, lastClose * (1 + drift + noise));

        const wickRange = Math.max(0.005, definition.volatility * 0.55);
        const intradayHigh = Math.max(lastClose, close) * (1 + rng.float(0, wickRange));
        const intradayLow = Math.min(lastClose, close) * (1 - rng.float(0, wickRange));

        const baseVolume = 100_000 + definition.basePrice * 800;
        const volumeNoise = rng.float(0.6, 1.6);
        const stressMultiplier = 1 + Math.abs((close - lastClose) / lastClose) * 4;
        const volume = Math.round(baseVolume * volumeNoise * stressMultiplier);

        const point: PricePoint = {
          day,
          price: roundMoney(close),
          open: roundMoney(lastClose),
          high: roundMoney(intradayHigh),
          low: roundMoney(intradayLow),
          close: roundMoney(close),
          volume
        };
        lastClose = close;
        return point;
      });

      return {
        definition,
        prices,
        signal: createSignal(definition.quality, regime)
      };
    })
  };
}

function createSignal(quality: number, regime: MarketRegime) {
  if (quality > 0.65) return `Analysts quietly like this name during ${regime.toLowerCase().replaceAll('_', ' ')}.`;
  if (quality < 0.45) return 'The tape is jumpy and the signal quality is poor.';
  return 'Mixed signals: price action matters more than headlines.';
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
