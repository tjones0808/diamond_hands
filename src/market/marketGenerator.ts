import type {
  AnalystRating,
  MarketRegime,
  MarketTicker,
  PricePoint,
  TickerDefinition,
  TickerSnapshot,
  WeekDay
} from '../game/types';
import { tickerDefinitions } from '../content/tickers';
import { createRng } from '../simulation/rng';
import type { Rng } from '../simulation/rng';

const weekDays: WeekDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const regimes: MarketRegime[] = ['CALM', 'EARNINGS_STORM', 'FED_WEEK', 'CRASH_WATCH', 'MELT_UP', 'MEME_MANIA'];

/** Number of historical bars we keep at minimum so the chart always has context. */
const HISTORY_BARS = 15;
/** Total bars shown on the chart: history + 5 current-week bars. */
const CHART_BAR_COUNT = HISTORY_BARS + weekDays.length;

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
  /** Authoritative ticker series, used to back the chart history. Replaces or extends run.tickerSeries. */
  tickerSeries: Record<string, PricePoint[]>;
}

/** First-time generation for a fresh run. Picks 8 tickers and produces 15 history + 5 current bars each. */
export function generateInitialMarketState(seed: number): GeneratedMarketWeek {
  const rng = createRng(seed);
  const regime = rng.pick(regimes);
  const shuffled = [...tickerDefinitions].sort(() => rng.next() - 0.5);
  const selected = shuffled.slice(0, 8);

  const tickerSeries: Record<string, PricePoint[]> = {};
  const tickers: MarketTicker[] = selected.map((definition) => {
    const fullSeries = generateInitialSeries(definition, regime, rng);
    tickerSeries[definition.symbol] = fullSeries;
    return composeTicker(definition, fullSeries, regime, rng);
  });

  return { regime, tickers, tickerSeries };
}

/** Continues an existing run into the next week. Walks 5 new bars per ticker from the prior FRI close. */
export function generateNextMarketWeek(
  seed: number,
  weekNumber: number,
  existingState: { tickers: MarketTicker[]; tickerSeries: Record<string, PricePoint[]> }
): GeneratedMarketWeek {
  const rng = createRng(seed + weekNumber * 1009);
  const regime = rng.pick(regimes);

  const updatedSeries: Record<string, PricePoint[]> = { ...existingState.tickerSeries };
  const tickers: MarketTicker[] = existingState.tickers.map((current) => {
    const definition = current.definition;
    const prior = existingState.tickerSeries[definition.symbol] ?? generateInitialSeries(definition, regime, rng);
    const lastClose = prior.at(-1)?.close ?? definition.basePrice;
    const newBars = walkBars(definition, regime, rng, lastClose, weekDays.length, false);
    const fullSeries = [...prior, ...newBars];
    updatedSeries[definition.symbol] = fullSeries;
    return composeTicker(definition, fullSeries, regime, rng);
  });

  return { regime, tickers, tickerSeries: updatedSeries };
}

function generateInitialSeries(definition: TickerDefinition, regime: MarketRegime, rng: Rng): PricePoint[] {
  // Walk one continuous series so the historical bars feed into Monday's open naturally.
  return walkBars(definition, regime, rng, definition.basePrice, CHART_BAR_COUNT, true);
}

function walkBars(
  definition: TickerDefinition,
  regime: MarketRegime,
  rng: Rng,
  startingClose: number,
  count: number,
  mutedHistory: boolean
): PricePoint[] {
  const bars: PricePoint[] = [];
  let lastClose = startingClose;

  for (let index = 0; index < count; index += 1) {
    const day = weekDays[index % weekDays.length];

    const baseDrift = regimeBias[regime] + (definition.quality - 0.5) * 0.01;
    // Mute history slightly so the past doesn't dominate the visible range.
    const drift = mutedHistory && index < HISTORY_BARS ? baseDrift * 0.6 : baseDrift;

    // Standard noise plus an occasional "big move" event for more variability.
    let noise = rng.float(-definition.volatility, definition.volatility);
    if (rng.next() < 0.08) noise *= rng.float(1.5, 2.4);
    if (rng.next() < 0.03) noise += rng.float(-definition.volatility, definition.volatility) * 1.8;

    const close = Math.max(1, lastClose * (1 + drift + noise));

    const wickRange = Math.max(0.005, definition.volatility * 0.6);
    const intradayHigh = Math.max(lastClose, close) * (1 + rng.float(0, wickRange));
    const intradayLow = Math.min(lastClose, close) * (1 - rng.float(0, wickRange));

    const baseVolume = 100_000 + definition.basePrice * 800;
    const volumeNoise = rng.float(0.55, 1.75);
    const stressMultiplier = 1 + Math.abs((close - lastClose) / lastClose) * 4;
    const volume = Math.round(baseVolume * volumeNoise * stressMultiplier);

    bars.push({
      day,
      price: roundMoney(close),
      open: roundMoney(lastClose),
      high: roundMoney(intradayHigh),
      low: roundMoney(intradayLow),
      close: roundMoney(close),
      volume
    });
    lastClose = close;
  }

  return bars;
}

function composeTicker(
  definition: TickerDefinition,
  fullSeries: PricePoint[],
  regime: MarketRegime,
  rng: Rng
): MarketTicker {
  const currentWeek = fullSeries.slice(-weekDays.length);
  const priorHistory = fullSeries.slice(-CHART_BAR_COUNT, -weekDays.length);
  // Pick the narrative beat for this week — deterministic per ticker per cycle.
  const arc = definition.narrativeArc;
  const arcIndex = arc && arc.length > 0
    ? Math.floor(rng.next() * arc.length)
    : 0;
  const narrative = arc && arc.length > 0 ? arc[arcIndex] : definition.fundamentals.narrative;
  const definitionWithArc: TickerDefinition = {
    ...definition,
    fundamentals: { ...definition.fundamentals, narrative }
  };
  return {
    definition: definitionWithArc,
    prices: currentWeek,
    priorHistory,
    signal: createSignal(definition.quality, regime),
    snapshot: buildSnapshot(definitionWithArc, fullSeries, rng)
  };
}

function buildSnapshot(definition: TickerDefinition, fullSeries: PricePoint[], rng: Rng): TickerSnapshot {
  const fundamentals = definition.fundamentals;

  const ratingScore = definition.quality * 1.2 + fundamentals.revenueGrowth / 100 * 0.6 - definition.volatility * 0.4;
  let analystRating: AnalystRating;
  let analystTargetPct: number;
  if (ratingScore > 0.95) {
    analystRating = 'STRONG_BUY';
    analystTargetPct = 18 + rng.float(0, 8);
  } else if (ratingScore > 0.7) {
    analystRating = 'BUY';
    analystTargetPct = 8 + rng.float(0, 8);
  } else if (ratingScore > 0.5) {
    analystRating = 'HOLD';
    analystTargetPct = -2 + rng.float(0, 6);
  } else if (ratingScore > 0.35) {
    analystRating = 'SELL';
    analystTargetPct = -10 + rng.float(0, 6);
  } else {
    analystRating = 'STRONG_SELL';
    analystTargetPct = -20 + rng.float(0, 6);
  }

  const capFactor = fundamentals.marketCap === 'SMALL' ? 1.4 : fundamentals.marketCap === 'MID' ? 1.0 : 0.6;
  const shortInterestPct = round1(Math.min(48, Math.max(1.5, (1 - definition.quality) * 32 + definition.volatility * 60 * capFactor + rng.float(0, 5))));

  const fiftyTwoWeekHigh = round2(Math.max(...fullSeries.map((b) => b.high)));
  const fiftyTwoWeekLow = round2(Math.min(...fullSeries.map((b) => b.low)));

  return {
    analystRating,
    analystTargetPct: round1(analystTargetPct),
    shortInterestPct,
    fiftyTwoWeekHigh,
    fiftyTwoWeekLow,
    recentHeadlines: buildHeadlines(definition, analystRating, rng)
  };
}

function buildHeadlines(definition: TickerDefinition, rating: AnalystRating, rng: Rng): string[] {
  const company = definition.name;
  const symbol = definition.symbol;
  const bullish = rating === 'STRONG_BUY' || rating === 'BUY';
  const bearish = rating === 'STRONG_SELL' || rating === 'SELL';

  const candidates: string[] = [];

  if (bullish) {
    candidates.push(`Top desk reiterates conviction on ${company}`);
    candidates.push(`${symbol} flagged as a long-side setup by quant desks`);
  }
  if (bearish) {
    candidates.push(`Activist short adds ${symbol} to public watchlist`);
    candidates.push(`Sell-side trims price targets on ${company}`);
  }
  if (definition.fundamentals.earningsThisWeek) {
    candidates.push(`${symbol} earnings on deck — implied moves widen`);
  }
  if (definition.fundamentals.revenueGrowth >= 15) {
    candidates.push(`${company} guides revenue growth above the street`);
  }
  if (definition.fundamentals.revenueGrowth < 0) {
    candidates.push(`${company} cuts FY guide; analysts split on second-half`);
  }
  candidates.push(`Options flow building in ${symbol} ahead of close`);
  candidates.push(`${definition.sector} sector ${rng.float(0, 1) > 0.5 ? 'ratchets higher' : 'cools off'} on macro headlines`);
  candidates.push(`Trade desks flag ${symbol} liquidity unusual today`);
  candidates.push(`${company} relative strength vs sector benchmark ${rng.float(0, 1) > 0.5 ? 'expanding' : 'compressing'}`);
  candidates.push(`Implied volatility in ${symbol} ${rng.float(0, 1) > 0.5 ? 'firming' : 'softening'} into Friday`);

  const shuffled = [...candidates].sort(() => rng.next() - 0.5);
  return shuffled.slice(0, 3);
}

function createSignal(quality: number, regime: MarketRegime) {
  if (quality > 0.65) return `Analysts quietly like this name during ${regime.toLowerCase().replaceAll('_', ' ')}.`;
  if (quality < 0.45) return 'The tape is jumpy and the signal quality is poor.';
  return 'Mixed signals: price action matters more than headlines.';
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

/**
 * Back-compat alias for the old name. Generates the initial market state for a new run.
 */
export const generateMarketWeek = generateInitialMarketState;
