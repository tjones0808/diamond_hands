import type { PricePoint, WeekDay } from '../game/types';

export type Trend = 'UP' | 'DOWN' | 'SIDEWAYS';

export interface Technicals {
  trend: Trend;
  momentumPct: number;
  movingAverage: number;
  support: number;
  resistance: number;
  averageVolume: number;
  rsi: number;
  pricesSoFar: number;
}

const dayOrder: WeekDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

export function computeTechnicals(prices: PricePoint[], currentDay: WeekDay): Technicals {
  const currentIndex = dayOrder.indexOf(currentDay);
  const visible = prices.filter((point) => dayOrder.indexOf(point.day) <= currentIndex);

  if (visible.length === 0) {
    const fallback = prices[0]?.close ?? 1;
    return {
      trend: 'SIDEWAYS',
      momentumPct: 0,
      movingAverage: fallback,
      support: fallback,
      resistance: fallback,
      averageVolume: 0,
      rsi: 50,
      pricesSoFar: 0
    };
  }

  const closes = visible.map((point) => point.close);
  const opens = visible.map((point) => point.open);
  const highs = visible.map((point) => point.high);
  const lows = visible.map((point) => point.low);
  const volumes = visible.map((point) => point.volume);

  const movingAverage = average(closes);
  const support = Math.min(...lows);
  const resistance = Math.max(...highs);
  const averageVolume = Math.round(average(volumes));

  const firstClose = closes[0];
  const lastClose = closes[closes.length - 1];
  const momentumPct = firstClose === 0 ? 0 : ((lastClose - firstClose) / firstClose) * 100;

  let trend: Trend = 'SIDEWAYS';
  if (momentumPct > 1.5) trend = 'UP';
  else if (momentumPct < -1.5) trend = 'DOWN';

  const rsi = computeRsi(opens, closes);

  return {
    trend,
    momentumPct: round(momentumPct, 1),
    movingAverage: round(movingAverage, 2),
    support: round(support, 2),
    resistance: round(resistance, 2),
    averageVolume,
    rsi: round(rsi, 0),
    pricesSoFar: visible.length
  };
}

function computeRsi(opens: number[], closes: number[]) {
  if (opens.length === 0) return 50;
  let gains = 0;
  let losses = 0;
  for (let index = 0; index < opens.length; index += 1) {
    const delta = closes[index] - opens[index];
    if (delta > 0) gains += delta;
    else losses -= delta;
  }
  if (gains + losses === 0) return 50;
  return (gains / (gains + losses)) * 100;
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function round(value: number, places: number) {
  const factor = Math.pow(10, places);
  return Math.round(value * factor) / factor;
}
