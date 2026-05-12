import type { GameEvent, RunState } from '../game/types';
import { eventDeck } from '../content/events';
import { createRng } from '../simulation/rng';

/**
 * Computes what Wednesday's event WILL be, without applying it. Used by the Better News
 * Feed upgrade to give the player a sector-level hint on Monday/Tuesday.
 */
export function previewWednesdayShock(run: RunState): GameEvent | undefined {
  if (run.day === 'WED' || run.day === 'THU' || run.day === 'FRI') return undefined;
  if (run.tickers.length === 0) return undefined;
  // Same seeding pattern as applyWednesdayShock in reducer.ts.
  const rng = createRng(run.seed + run.week * 97);
  const event = rng.pick(eventDeck);
  const impacted = event.symbol
    ?? run.tickers.find((ticker) => ticker.definition.sector === event.sector)?.definition.symbol
    ?? rng.pick(run.tickers).definition.symbol;
  return { ...event, symbol: impacted };
}

export interface WednesdayHint {
  sector?: string;
  symbol?: string;
  tone: 'bull' | 'bear' | 'neutral';
  headline: string;
}

export function buildWednesdayHint(run: RunState): WednesdayHint | undefined {
  const event = previewWednesdayShock(run);
  if (!event) return undefined;
  const sector = run.tickers.find((t) => t.definition.symbol === event.symbol)?.definition.sector ?? event.sector;
  const tone: WednesdayHint['tone'] = event.priceImpact > 0.05 ? 'bull' : event.priceImpact < -0.05 ? 'bear' : 'neutral';
  const direction = tone === 'bull' ? 'bullish' : tone === 'bear' ? 'bearish' : 'mixed';
  const sectorPhrase = sector ? sector.toLowerCase() : 'broad market';
  const headline = `Whispers of ${direction} news brewing in ${sectorPhrase}.`;
  return { sector, symbol: event.symbol, tone, headline };
}
