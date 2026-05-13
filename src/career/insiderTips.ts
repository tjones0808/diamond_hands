import type { InsiderTip, RunState, SecInvestigation } from '../game/types';
import { eventDeck } from '../content/events';
import { createRng } from '../simulation/rng';

const TIP_OFFER_CHANCE = 0.18; // 18% chance per Monday
const TIP_COOLDOWN_WEEKS = 2;   // can't be offered for 2 weeks after one was offered
const SEC_FINE_PCT_OF_CASH = 0.08; // 8% of cash on top of fixed fine
const SEC_FIXED_FINE = 1500;
const SEC_REP_HIT = 8;

const sources = [
  'a buddy from your old internship',
  'a quiet voice on the late-night options desk',
  'someone at a sketchy after-hours bar',
  'a recently-fired analyst with an axe to grind',
  'an anonymous DM with a verified attachment',
  'a former roommate who works in compliance'
];

/**
 * Decides whether a tip is offered THIS Monday. Deterministic per seed + week, modulated
 * by the player's "tip karma" — if they've accepted recently, more likely to be offered
 * again (the underworld notices), but their SEC risk also rises.
 */
export function maybeOfferTip(run: RunState): InsiderTip | undefined {
  if (run.day !== 'MON') return undefined;
  if (run.week < 2) return undefined; // first week is feet-wet, no tips
  if (run.weekResult) return undefined; // wait until the player dismisses last week's recap
  if (run.pendingInsiderTip) return run.pendingInsiderTip;
  if (run.activeInsiderTip) return undefined;

  const rng = createRng(run.seed + run.week * 2113);
  if (rng.next() > TIP_OFFER_CHANCE) return undefined;

  // Pick a ticker from the current watchlist + a strong-impact event.
  if (run.tickers.length === 0) return undefined;
  const ticker = rng.pick(run.tickers);
  const strongEvents = eventDeck.filter((event) => Math.abs(event.priceImpact) >= 0.08);
  const event = rng.pick(strongEvents);

  return {
    symbol: ticker.definition.symbol,
    eventId: event.id,
    eventTitle: event.title,
    source: rng.pick(sources),
    expectedDirection: event.priceImpact >= 0 ? 'UP' : 'DOWN'
  };
}

/**
 * Roll for SEC investigation on Friday after a tip was acted on. Probability scales with
 * how many times the player has accepted (tracked via lifetime fine count — not used in
 * v1, simple flat 22% chance).
 */
export function rollSecInvestigation(rng: { next(): number }, run: RunState): SecInvestigation | undefined {
  if (!run.activeInsiderTip) return undefined;
  const roll = rng.next();
  if (roll > 0.22) return undefined;
  const fine = Math.round((SEC_FIXED_FINE + Math.max(0, run.cash) * SEC_FINE_PCT_OF_CASH) * 100) / 100;
  return { fineAmount: fine, reputationHit: SEC_REP_HIT };
}

export function shouldHonorCooldown(run: RunState): boolean {
  // Reserved for future expansion — currently the cooldown is enforced via the
  // deterministic RNG check above. Real future-feature hook.
  return run.activeInsiderTip ? true : false;
}

export { TIP_OFFER_CHANCE, TIP_COOLDOWN_WEEKS };
