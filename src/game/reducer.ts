import type { GameState } from './types';
import { advanceDay } from '../week/weekEngine';
import { buyCall, buyPut, buyShares, closeOptionsForSymbol, sellShares, settleOptions } from '../trading/tradingEngine';
import { eventDeck } from '../content/events';
import { createRng } from '../simulation/rng';
import { applyWeekOutcome, checkBankruptcy, evaluatePromotion } from '../career/careerEngine';
import { getNetWorth } from './selectors';

export type GameAction =
  | { type: 'BUY_SHARES'; symbol: string; quantity: number; price: number }
  | { type: 'SELL_SHARES'; symbol: string; quantity: number; price: number }
  | { type: 'BUY_CALL'; symbol: string; strike: number; quantity: number; premium: number }
  | { type: 'BUY_PUT'; symbol: string; strike: number; quantity: number; premium: number }
  | { type: 'CLOSE_OPTIONS'; symbol: string; currentPrice: number; volatility: number }
  | { type: 'ADVANCE_DAY' }
  | { type: 'UNLOCK_SECOND_MONITOR' }
  | { type: 'UNLOCK_BETTER_NEWS_FEED' };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'BUY_SHARES':
      return { ...state, run: checkBankruptcy(buyShares(state.run, action.symbol, action.quantity, action.price)) };
    case 'SELL_SHARES':
      return { ...state, run: checkBankruptcy(sellShares(state.run, action.symbol, action.quantity, action.price)) };
    case 'BUY_CALL':
      return { ...state, run: checkBankruptcy(buyCall(state.run, action.symbol, action.strike, action.quantity, action.premium)) };
    case 'BUY_PUT':
      return { ...state, run: checkBankruptcy(buyPut(state.run, action.symbol, action.strike, action.quantity, action.premium)) };
    case 'CLOSE_OPTIONS':
      return { ...state, run: checkBankruptcy(closeOptionsForSymbol(state.run, action.symbol, action.currentPrice, action.volatility)) };
    case 'UNLOCK_SECOND_MONITOR':
      if (state.save.unlocks.secondMonitor || state.run.cash < 750) return state;
      return {
        ...state,
        run: {
          ...state.run,
          cash: Math.round((state.run.cash - 750) * 100) / 100,
          weekLog: [...state.run.weekLog, 'Installed a second monitor. The room feels slightly less doomed.']
        },
        save: { ...state.save, unlocks: { ...state.save.unlocks, secondMonitor: true } }
      };
    case 'UNLOCK_BETTER_NEWS_FEED':
      if (state.save.unlocks.betterNewsFeed || state.run.cash < 1200) return state;
      return {
        ...state,
        run: {
          ...state.run,
          cash: Math.round((state.run.cash - 1200) * 100) / 100,
          weekLog: [...state.run.weekLog, 'Subscribed to a better news feed. Wednesday shocks get a little less mysterious.']
        },
        save: { ...state.save, unlocks: { ...state.save.unlocks, betterNewsFeed: true } }
      };
    case 'ADVANCE_DAY':
      return advanceRunDay(state);
  }
}

function advanceRunDay(state: GameState): GameState {
  if (state.run.isBankrupt) return state;

  if (state.run.day === 'TUE') {
    return { ...state, run: applyWednesdayShock(advanceDay(state.run)) };
  }

  if (state.run.day !== 'FRI') {
    return { ...state, run: advanceDay(state.run) };
  }

  const beforeNetWorth = getNetWorth(state.run);
  const finalPrices = Object.fromEntries(state.run.tickers.map((ticker) => [ticker.definition.symbol, ticker.prices.at(-1)?.price ?? ticker.definition.basePrice]));
  const settled = settleOptions(state.run, finalPrices);
  const afterNetWorth = getNetWorth(settled);
  const outcome = applyWeekOutcome({ cashDelta: afterNetWorth - beforeNetWorth, reputation: settled.reputation, xp: settled.xp });
  const promotion = evaluatePromotion({
    tier: settled.tier,
    reputation: outcome.reputation,
    xp: outcome.xp,
    netWorth: afterNetWorth
  });
  const nextRun = advanceDay({
    ...settled,
    tier: promotion.tier,
    reputation: outcome.reputation,
    xp: outcome.xp,
    weekLog: [
      ...settled.weekLog,
      `Friday expiry closed. Net worth moved ${formatSigned(afterNetWorth - beforeNetWorth)}.`,
      outcome.reputation > settled.reputation ? 'Your reputation ticks up after a profitable week.' : 'You log the lesson and prepare for Monday.',
      ...(promotion.promoted ? [`Promotion unlocked: ${promotion.tier.replaceAll('_', ' ')}.`] : [])
    ]
  });

  return {
    ...state,
    run: checkBankruptcy(nextRun),
    save: {
      ...state.save,
      bestNetWorth: Math.max(state.save.bestNetWorth, afterNetWorth)
    }
  };
}

function applyWednesdayShock(run: GameState['run']): GameState['run'] {
  const rng = createRng(run.seed + run.week * 97);
  const event = rng.pick(eventDeck);
  const impacted = event.symbol ?? run.tickers.find((ticker) => ticker.definition.sector === event.sector)?.definition.symbol ?? rng.pick(run.tickers).definition.symbol;
  const tickers = run.tickers.map((ticker) => {
    if (ticker.definition.symbol !== impacted) return ticker;
    const prices = ticker.prices.map((point) => point.day === 'WED'
      ? { ...point, price: Math.max(1, Math.round(point.price * (1 + event.priceImpact) * 100) / 100) }
      : point);
    return { ...ticker, prices };
  });

  return {
    ...run,
    tickers,
    activeEvent: { ...event, symbol: impacted },
    reputation: Math.max(0, Math.min(100, run.reputation + event.reputationImpact)),
    weekLog: [
      ...run.weekLog,
      `${event.title}: ${event.description} ${impacted} reprices hard.`
    ]
  };
}

function formatSigned(value: number) {
  const rounded = Math.round(value * 100) / 100;
  return `${rounded >= 0 ? '+' : ''}$${rounded.toLocaleString()}`;
}
