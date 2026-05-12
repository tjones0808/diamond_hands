import type { GameState, OptionExpiryDay, RunState, WeekDay } from './types';
// OptionExpiryDay is also used by tagTechnicalTrade helper below.
import { advanceDay } from '../week/weekEngine';
import {
  buyCall,
  buyPut,
  buyShares,
  closeOptionsForSymbol,
  openMultiLegOptions,
  sellShares,
  settleExpiringOptions
} from '../trading/tradingEngine';
import { eventDeck } from '../content/events';
import { createRng } from '../simulation/rng';
import { applyWeekOutcome, checkBankruptcy, evaluatePromotion } from '../career/careerEngine';
import { getNetWorth } from './selectors';
import { buildWeekResult } from '../week/weekRecap';
import type { OpenMultiLegInput } from '../trading/tradingEngine';
import { getStartingPerk, highestTier, tierArtifacts } from '../content/tierRewards';
import { playSfx } from '../audio/audioEngine';
import { getBossDefinition, isBossEligible, resolveBossWeek } from '../career/bossWeek';
import { appendRunSummary, applyWeekResultToStats, recordBankruptcy } from '../save/runJournal';

export function checkBossWeekStart(run: RunState): RunState {
  if (run.bossWeek) return run;
  if (!isBossEligible(run)) return run;
  const definition = getBossDefinition(run.tier);
  if (!definition) return run;
  return {
    ...run,
    bossWeek: { definition, startedAtWeek: run.week },
    weekLog: [
      ...run.weekLog,
      `BOSS WEEK: ${definition.title}. ${definition.intro} (${definition.requirementSummary})`
    ]
  };
}

export type GameAction =
  | { type: 'BUY_SHARES'; symbol: string; quantity: number; price: number }
  | { type: 'SELL_SHARES'; symbol: string; quantity: number; price: number }
  | { type: 'BUY_CALL'; symbol: string; strike: number; quantity: number; premium: number; expiresDay?: OptionExpiryDay }
  | { type: 'BUY_PUT'; symbol: string; strike: number; quantity: number; premium: number; expiresDay?: OptionExpiryDay }
  | { type: 'OPEN_STRATEGY'; input: OpenMultiLegInput }
  | { type: 'CLOSE_OPTIONS'; symbol: string; currentPrice: number; volatility: number }
  | { type: 'ADVANCE_DAY' }
  | { type: 'DISMISS_RECAP' }
  | { type: 'COMPLETE_TUTORIAL' }
  | { type: 'TOGGLE_AUDIO_MUTE' }
  | { type: 'UNLOCK_SECOND_MONITOR' }
  | { type: 'UNLOCK_BETTER_NEWS_FEED' };

const expiryDays: OptionExpiryDay[] = ['TUE', 'THU', 'FRI'];

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'BUY_SHARES': {
      playSfx('buy');
      const run = buyShares(state.run, action.symbol, action.quantity, action.price);
      return { ...state, run: checkBankruptcy(tagFundamentalTrade(run, state.run)) };
    }
    case 'SELL_SHARES':
      playSfx('sell');
      return { ...state, run: checkBankruptcy(sellShares(state.run, action.symbol, action.quantity, action.price)) };
    case 'BUY_CALL': {
      playSfx('buy');
      const expiry = action.expiresDay ?? 'FRI';
      const run = buyCall(state.run, action.symbol, action.strike, action.quantity, action.premium, expiry);
      return { ...state, run: checkBankruptcy(tagTechnicalTrade(run, state.run, expiry)) };
    }
    case 'BUY_PUT': {
      playSfx('buy');
      const expiry = action.expiresDay ?? 'FRI';
      const run = buyPut(state.run, action.symbol, action.strike, action.quantity, action.premium, expiry);
      return { ...state, run: checkBankruptcy(tagTechnicalTrade(run, state.run, expiry)) };
    }
    case 'OPEN_STRATEGY': {
      playSfx('buy');
      const run = openMultiLegOptions(state.run, action.input);
      return { ...state, run: checkBankruptcy(tagTechnicalTrade(run, state.run, action.input.expiresDay)) };
    }
    case 'CLOSE_OPTIONS':
      playSfx('sell');
      return { ...state, run: checkBankruptcy(closeOptionsForSymbol(state.run, action.symbol, action.currentPrice, action.volatility)) };
    case 'DISMISS_RECAP':
      if (!state.run.weekResult) return state;
      return { ...state, run: { ...state.run, weekResult: undefined } };
    case 'COMPLETE_TUTORIAL':
      if (state.save.hasCompletedTutorial) return state;
      return { ...state, save: { ...state.save, hasCompletedTutorial: true } };
    case 'TOGGLE_AUDIO_MUTE':
      return { ...state, save: { ...state.save, audioMuted: !state.save.audioMuted } };
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

  const currentDay = state.run.day;

  if (currentDay === 'TUE') {
    const settled = settleIfExpiringToday(state.run, currentDay);
    playExpirySfx(state.run, settled);
    playSfx('dayAdvance');
    const afterShock = applyWednesdayShock(advanceDay(settled));
    if (afterShock.activeEvent) playSfx('shock');
    return { ...state, run: afterShock };
  }

  if (currentDay === 'THU') {
    const settled = settleIfExpiringToday(state.run, currentDay);
    playExpirySfx(state.run, settled);
    playSfx('dayAdvance');
    return { ...state, run: advanceDay(settled) };
  }

  if (currentDay !== 'FRI') {
    playSfx('dayAdvance');
    return { ...state, run: advanceDay(state.run) };
  }

  const beforeNetWorth = getNetWorth(state.run);
  const beforeCash = state.run.cash;
  const beforeReputation = state.run.reputation;
  const beforeXp = state.run.xp;
  const activeEvent = state.run.activeEvent;
  let settled = settleIfExpiringToday(state.run, 'FRI');
  let afterNetWorth = getNetWorth(settled);
  const outcome = applyWeekOutcome({ cashDelta: afterNetWorth - beforeNetWorth, reputation: settled.reputation, xp: settled.xp });

  // Boss week resolution gates promotion. Without an active boss week, the player keeps progress
  // but cannot promote — they must trigger a boss week next eligibility Monday.
  let bossResolution: ReturnType<typeof resolveBossWeek> | undefined;
  let bossReputationDelta = 0;
  if (state.run.bossWeek) {
    bossResolution = resolveBossWeek(state.run.bossWeek.definition, afterNetWorth);
    bossReputationDelta = bossResolution.reputationDelta;
    if (bossResolution.cashDelta) {
      settled = { ...settled, cash: Math.round((settled.cash + bossResolution.cashDelta) * 100) / 100 };
      afterNetWorth = getNetWorth(settled);
    }
  }

  const reputationAfterBoss = Math.max(0, Math.min(100, outcome.reputation + bossReputationDelta));
  const promotion = state.run.bossWeek && bossResolution?.passed
    ? evaluatePromotion({
        tier: settled.tier,
        reputation: reputationAfterBoss,
        xp: outcome.xp,
        netWorth: afterNetWorth
      })
    : { tier: settled.tier, promoted: false, gate: undefined as never };
  const beforeTier = settled.tier;
  const newTier = promotion.promoted ? promotion.tier : settled.tier;
  const newArtifact = promotion.promoted ? tierArtifacts[newTier] : undefined;
  const nextHighest = highestTier(state.save.highestTier, newTier);
  const nextRunPerk = promotion.promoted ? getStartingPerk(nextHighest) : undefined;
  const weekResult = buildWeekResult({
    week: state.run.week,
    startNetWorth: beforeNetWorth,
    endNetWorth: afterNetWorth,
    startCash: beforeCash,
    endCash: settled.cash,
    optionResults: settled.weekOptionResults,
    event: activeEvent,
    reputationDelta: outcome.reputation - beforeReputation,
    xpGained: outcome.xp - beforeXp,
    promoted: promotion.promoted,
    promotedFromTier: promotion.promoted ? beforeTier : undefined,
    promotedToTier: promotion.promoted ? newTier : undefined,
    newArtifact,
    nextRunPerk,
    bossResolution,
    bossDefinition: state.run.bossWeek?.definition
  });
  const bossLogs = bossResolution
    ? [
        bossResolution.summary,
        bossResolution.passed
          ? 'Boss-week reputation bonus locked in.'
          : `Reputation penalty: ${bossResolution.reputationDelta}. Cash penalty: $${Math.abs(bossResolution.cashDelta)}.`
      ]
    : [];

  const advanced = advanceDay({
    ...settled,
    tier: promotion.tier,
    reputation: reputationAfterBoss,
    xp: outcome.xp,
    activeEvent: undefined,
    bossWeek: undefined,
    weekLog: [
      ...settled.weekLog,
      `Friday expiry closed. Net worth moved ${formatSigned(afterNetWorth - beforeNetWorth)}.`,
      outcome.reputation > settled.reputation ? 'Your reputation ticks up after a profitable week.' : 'You log the lesson and prepare for Monday.',
      ...bossLogs,
      ...(promotion.promoted ? [`Promotion unlocked: ${promotion.tier.replaceAll('_', ' ')}.`] : [])
    ]
  });

  const mondayRun = maybeStartBossWeek(advanced);

  const updatedTiersReached = promotion.promoted && !state.save.tiersEverReached.includes(newTier)
    ? [...state.save.tiersEverReached, newTier]
    : state.save.tiersEverReached;

  // Friday settle sound effects
  playExpirySfx(state.run, settled);
  if (promotion.promoted) {
    playSfx('promotion');
  } else if (afterNetWorth - beforeNetWorth > 0) {
    playSfx('profit');
  } else if (afterNetWorth - beforeNetWorth < -100) {
    playSfx('loss');
  }
  const nextRun = checkBankruptcy({ ...mondayRun, weekResult, weekOptionResults: [] });
  if (nextRun.isBankrupt && !state.run.isBankrupt) playSfx('bankruptcy');
  if (nextRun.bossWeek) playSfx('bossReveal');

  let nextStats = applyWeekResultToStats(state.save.stats, weekResult);
  let nextSave = {
    ...state.save,
    bestNetWorth: Math.max(state.save.bestNetWorth, afterNetWorth),
    tiersEverReached: updatedTiersReached,
    highestTier: nextHighest,
    stats: nextStats
  };
  if (nextRun.isBankrupt && !state.run.isBankrupt) {
    nextSave = {
      ...nextSave,
      stats: recordBankruptcy(nextSave.stats),
      runsCompleted: nextSave.runsCompleted + 1
    };
    nextSave = appendRunSummary(nextSave, nextRun, afterNetWorth);
  }

  return {
    ...state,
    run: nextRun,
    save: nextSave
  };
}

function maybeStartBossWeek(run: RunState): RunState {
  if (run.bossWeek) return run;
  if (!isBossEligible(run)) return run;
  const definition = getBossDefinition(run.tier);
  if (!definition) return run;

  return {
    ...run,
    bossWeek: { definition, startedAtWeek: run.week },
    weekLog: [
      ...run.weekLog,
      `BOSS WEEK: ${definition.title}. ${definition.intro} (${definition.requirementSummary})`
    ]
  };
}

function tagFundamentalTrade(after: RunState, before: RunState): RunState {
  // A new share trade only counts as fundamental if it actually executed (cash decreased).
  if (after.cash >= before.cash) return after;
  return { ...after, fundamentalScore: after.fundamentalScore + 1 };
}

function tagTechnicalTrade(after: RunState, before: RunState, expiresDay: OptionExpiryDay): RunState {
  if (after.cash >= before.cash) return after;
  // Short-DTE option opens read as technical plays; FRI counts less.
  const score = expiresDay === 'FRI' ? 1 : 2;
  return { ...after, technicalScore: after.technicalScore + score };
}

function playExpirySfx(before: RunState, after: RunState) {
  const newResults = after.weekOptionResults.slice(before.weekOptionResults.length);
  if (newResults.length === 0) return;
  const itm = newResults.some((result) => result.expiredInTheMoney);
  playSfx(itm ? 'expiryItm' : 'expiryOtm');
}

function settleIfExpiringToday(run: RunState, day: WeekDay): RunState {
  if (!isOptionExpiryDay(day)) return run;
  const finalPrices = Object.fromEntries(
    run.tickers.map((ticker) => {
      const todayPrice = ticker.prices.find((point) => point.day === day)?.price
        ?? ticker.prices.at(-1)?.price
        ?? ticker.definition.basePrice;
      return [ticker.definition.symbol, todayPrice];
    })
  );
  return settleExpiringOptions(run, day, finalPrices);
}

function isOptionExpiryDay(day: WeekDay): day is OptionExpiryDay {
  return expiryDays.includes(day as OptionExpiryDay);
}

function applyWednesdayShock(run: RunState): RunState {
  const rng = createRng(run.seed + run.week * 97);
  const event = rng.pick(eventDeck);
  const impacted = event.symbol ?? run.tickers.find((ticker) => ticker.definition.sector === event.sector)?.definition.symbol ?? rng.pick(run.tickers).definition.symbol;
  const tickers = run.tickers.map((ticker) => {
    if (ticker.definition.symbol !== impacted) return ticker;
    const prices = ticker.prices.map((point) => {
      if (point.day !== 'WED') return point;
      const multiplier = 1 + event.priceImpact;
      const newClose = Math.max(1, Math.round(point.close * multiplier * 100) / 100);
      return {
        ...point,
        price: newClose,
        close: newClose,
        high: Math.max(point.high, newClose),
        low: Math.min(point.low, newClose),
        volume: Math.round(point.volume * 1.6)
      };
    });
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
