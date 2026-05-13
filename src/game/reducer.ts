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
import { generateNextMarketWeek } from '../market/marketGenerator';
import { applyWeekOutcome, checkBankruptcy, evaluatePromotion } from '../career/careerEngine';
import { getNetWorth } from './selectors';
import { buildWeekResult } from '../week/weekRecap';
import type { OpenMultiLegInput } from '../trading/tradingEngine';
import { getStartingPerk, highestTier, tierArtifacts } from '../content/tierRewards';
import { playSfx } from '../audio/audioEngine';
import { getBossDefinition, isBossEligible, resolveBossWeek } from '../career/bossWeek';
import { appendRunSummary, applyWeekResultToStats, recordBankruptcy } from '../save/runJournal';
import { checkAchievements, insertIntoHallOfFame } from '../save/achievements';
import { applyMoodAfterWeek } from '../career/mood';
import { accrueMarginInterest } from '../trading/margin';
import { cancelRestingOrder, createRestingOrder, sweepRestingOrders } from '../trading/restingOrders';
import type { RestingOrderType } from './types';
import { attachClientsOnPromotion, settleClientsForWeek } from '../career/clientPortfolio';
import { captureDayStartNetWorth, checkDailyLossLimit } from '../career/dailyLossLimit';
import { tickRivalsForWeek } from '../career/rivals';
import { maybeOfferTip, rollSecInvestigation } from '../career/insiderTips';

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
  | { type: 'CREATE_RESTING_ORDER'; orderType: RestingOrderType; symbol: string; quantity: number; triggerPrice: number }
  | { type: 'CANCEL_RESTING_ORDER'; orderId: string }
  | { type: 'ADVANCE_DAY' }
  | { type: 'DISMISS_RECAP' }
  | { type: 'COMPLETE_TUTORIAL' }
  | { type: 'TOGGLE_AUDIO_MUTE' }
  | { type: 'UNLOCK_SECOND_MONITOR' }
  | { type: 'UNLOCK_BETTER_NEWS_FEED' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<import('./types').SettingsState> }
  | { type: 'RESET_TUTORIAL' }
  | { type: 'ACCEPT_INSIDER_TIP' }
  | { type: 'DECLINE_INSIDER_TIP' }
  | { type: 'DISMISS_SEC_INVESTIGATION' };

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
    case 'CREATE_RESTING_ORDER':
      playSfx('click');
      return { ...state, run: createRestingOrder(state.run, action.orderType, action.symbol, action.quantity, action.triggerPrice) };
    case 'CANCEL_RESTING_ORDER':
      return { ...state, run: cancelRestingOrder(state.run, action.orderId) };
    case 'DISMISS_RECAP': {
      if (!state.run.weekResult) return state;
      const cleared: RunState = { ...state.run, weekResult: undefined };
      const offered = maybeOfferTip(cleared);
      return { ...state, run: offered ? { ...cleared, pendingInsiderTip: offered } : cleared };
    }
    case 'COMPLETE_TUTORIAL':
      if (state.save.hasCompletedTutorial) return state;
      return { ...state, save: { ...state.save, hasCompletedTutorial: true } };
    case 'TOGGLE_AUDIO_MUTE':
      return { ...state, save: { ...state.save, audioMuted: !state.save.audioMuted } };
    case 'UPDATE_SETTINGS':
      return { ...state, save: { ...state.save, settings: { ...state.save.settings, ...action.settings } } };
    case 'RESET_TUTORIAL':
      return { ...state, save: { ...state.save, hasCompletedTutorial: false } };
    case 'ACCEPT_INSIDER_TIP': {
      if (!state.run.pendingInsiderTip) return state;
      return {
        ...state,
        run: {
          ...state.run,
          activeInsiderTip: state.run.pendingInsiderTip,
          pendingInsiderTip: undefined,
          weekLog: [
            ...state.run.weekLog,
            `You took the tip on ${state.run.pendingInsiderTip.symbol}. The wire is hot.`
          ]
        }
      };
    }
    case 'DECLINE_INSIDER_TIP':
      if (!state.run.pendingInsiderTip) return state;
      return {
        ...state,
        run: {
          ...state.run,
          pendingInsiderTip: undefined,
          reputation: Math.min(100, state.run.reputation + 1),
          weekLog: [...state.run.weekLog, 'You walked away from the tip. Clean conscience, +1 reputation.']
        }
      };
    case 'DISMISS_SEC_INVESTIGATION':
      if (!state.run.secInvestigation) return state;
      return { ...state, run: { ...state.run, secInvestigation: undefined } };
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
    const swept = sweepRestingOrders(state.run, currentDay);
    const settled = settleIfExpiringToday(swept, currentDay);
    const lossCheck = checkDailyLossLimit(settled);
    if (lossCheck.fired) return { ...state, run: lossCheck.run };
    playExpirySfx(state.run, settled);
    playSfx('dayAdvance');
    const afterShock = applyWednesdayShock(advanceDay(accrueMarginInterest(lossCheck.run)));
    if (afterShock.activeEvent) playSfx('shock');
    return { ...state, run: captureDayStartNetWorth(afterShock) };
  }

  if (currentDay === 'THU') {
    const swept = sweepRestingOrders(state.run, currentDay);
    const settled = settleIfExpiringToday(swept, currentDay);
    const lossCheck = checkDailyLossLimit(settled);
    if (lossCheck.fired) return { ...state, run: lossCheck.run };
    playExpirySfx(state.run, settled);
    playSfx('dayAdvance');
    return { ...state, run: captureDayStartNetWorth(advanceDay(accrueMarginInterest(lossCheck.run))) };
  }

  if (currentDay !== 'FRI') {
    const swept = sweepRestingOrders(state.run, currentDay);
    const lossCheck = checkDailyLossLimit(swept);
    if (lossCheck.fired) return { ...state, run: lossCheck.run };
    playSfx('dayAdvance');
    return { ...state, run: captureDayStartNetWorth(advanceDay(accrueMarginInterest(lossCheck.run))) };
  }

  // True weekly baseline = Monday's open snapshot, NOT Friday morning. The player may have
  // bought shares Monday and sold them Thursday at a profit; that change is already baked into
  // Friday's cash/net-worth, so a Friday-morning-vs-Friday-night delta would show $0.
  const weekStartNetWorth = state.run.weekStartNetWorth;
  const weekStartCash = state.run.weekStartCash;
  const beforeReputation = state.run.reputation;
  const beforeXp = state.run.xp;
  const activeEvent = state.run.activeEvent;
  const sweptFri = sweepRestingOrders(state.run, 'FRI');
  const fridayLossCheck = checkDailyLossLimit(sweptFri);
  if (fridayLossCheck.fired) return { ...state, run: fridayLossCheck.run };

  // SEC roll for accepted insider tips. Happens before settlement so the fine hits cash now.
  let postSec = fridayLossCheck.run;
  let secInvestigation: typeof state.run.secInvestigation;
  if (postSec.activeInsiderTip) {
    const secRng = createRng(state.run.seed + state.run.week * 17);
    secInvestigation = rollSecInvestigation(secRng, postSec);
    if (secInvestigation) {
      postSec = {
        ...postSec,
        cash: Math.max(0, Math.round((postSec.cash - secInvestigation.fineAmount) * 100) / 100),
        reputation: Math.max(0, postSec.reputation - secInvestigation.reputationHit),
        weekLog: [
          ...postSec.weekLog,
          `SEC investigation opened on ${postSec.activeInsiderTip.symbol} tip.`,
          `Fine: -$${secInvestigation.fineAmount.toFixed(2)}. Reputation: -${secInvestigation.reputationHit}.`
        ],
        secInvestigation
      };
    }
  }

  let settled = settleIfExpiringToday(accrueMarginInterest(postSec), 'FRI');
  let afterNetWorth = getNetWorth(settled);
  const outcome = applyWeekOutcome({ cashDelta: afterNetWorth - weekStartNetWorth, reputation: settled.reputation, xp: settled.xp });

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

  // Balanced Trader bonus: both styles ticked up AND the week was profitable.
  const balancedTrader = state.run.weekFundamentalScore > 0
    && state.run.weekTechnicalScore > 0
    && (afterNetWorth - weekStartNetWorth) > 0;
  const balancedTraderRepDelta = balancedTrader ? 2 : 0;
  const reputationAfterBoss = Math.max(0, Math.min(100, outcome.reputation + bossReputationDelta + balancedTraderRepDelta));
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
    startNetWorth: weekStartNetWorth,
    endNetWorth: afterNetWorth,
    startCash: weekStartCash,
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
    bossDefinition: state.run.bossWeek?.definition,
    balancedTrader,
    weekFundamentalTrades: state.run.weekFundamentalScore,
    weekTechnicalTrades: state.run.weekTechnicalScore
  });
  const bossLogs = bossResolution
    ? [
        bossResolution.summary,
        bossResolution.passed
          ? 'Boss-week reputation bonus locked in.'
          : `Reputation penalty: ${bossResolution.reputationDelta}. Cash penalty: $${Math.abs(bossResolution.cashDelta)}.`
      ]
    : [];

  // Settle client portfolio if any are present.
  const weeklyPerfPct = weekStartNetWorth > 0 ? (afterNetWorth - weekStartNetWorth) / weekStartNetWorth : 0;
  const clientResult = settleClientsForWeek(settled.clients, weeklyPerfPct);
  let settledWithClients = settled;
  const clientLogs: string[] = [];
  if (settled.clients.length > 0) {
    settledWithClients = {
      ...settled,
      clients: clientResult.clients,
      cash: Math.round((settled.cash + clientResult.totalFeeIncome) * 100) / 100,
      reputation: Math.max(0, Math.min(100, settled.reputation - clientResult.departed.length * 4))
    };
    if (clientResult.totalFeeIncome > 0) {
      clientLogs.push(`Client management fees collected: +$${clientResult.totalFeeIncome.toFixed(2)}.`);
    }
    for (const departed of clientResult.departed) {
      clientLogs.push(`${departed.name} redeemed their account. Reputation -4.`);
    }
  }
  // Recompute after-net-worth post fees so it reflects cash collected.
  afterNetWorth = getNetWorth(settledWithClients);
  const settledForMood = applyMoodAfterWeek(settledWithClients, afterNetWorth - weekStartNetWorth, bossResolution?.passed);
  const advanced = advanceDay({
    ...settledForMood,
    tier: promotion.tier,
    reputation: reputationAfterBoss,
    xp: outcome.xp,
    activeEvent: undefined,
    bossWeek: undefined,
    weekLog: [
      ...settledWithClients.weekLog,
      `Friday expiry closed. Net worth moved ${formatSigned(afterNetWorth - weekStartNetWorth)}.`,
      outcome.reputation > settled.reputation ? 'Your reputation ticks up after a profitable week.' : 'You log the lesson and prepare for Monday.',
      ...clientLogs,
      ...bossLogs,
      ...(promotion.promoted ? [`Promotion unlocked: ${promotion.tier.replaceAll('_', ' ')}.`] : [])
    ]
  });

  // Generate the new week's market continuing from each ticker's Friday close.
  const nextMarket = generateNextMarketWeek(state.run.seed, advanced.week, {
    tickers: advanced.tickers,
    tickerSeries: advanced.tickerSeries
  });
  const rivalRng = createRng(state.run.seed + advanced.week * 619);
  const updatedRivals = tickRivalsForWeek(advanced.rivals, rivalRng);
  const withNewMarket: typeof advanced = {
    ...advanced,
    marketRegime: nextMarket.regime,
    tickers: nextMarket.tickers,
    tickerSeries: nextMarket.tickerSeries,
    rivals: updatedRivals
  };

  // Snapshot Monday-open baselines and clear any resting orders left over from last week.
  const newMondayNw = getNetWorth(withNewMarket);
  let newWeekRun: typeof withNewMarket = {
    ...withNewMarket,
    weekStartCash: withNewMarket.cash,
    weekStartNetWorth: newMondayNw,
    dayStartNetWorth: newMondayNw,
    restingOrders: [],
    activeInsiderTip: undefined,
    pendingInsiderTip: undefined
  };
  // Tip is offered post-recap via DISMISS_RECAP so it doesn't stack on top of the modal.

  // Promotion to a tier with clients triggers a new roster generation.
  if (promotion.promoted) {
    const clientRng = createRng(state.run.seed + advanced.week * 53 + 7);
    newWeekRun = attachClientsOnPromotion(newWeekRun, promotion.tier, clientRng);
  }

  const mondayRun = maybeStartBossWeek(newWeekRun);

  const updatedTiersReached = promotion.promoted && !state.save.tiersEverReached.includes(newTier)
    ? [...state.save.tiersEverReached, newTier]
    : state.save.tiersEverReached;

  // Friday settle sound effects
  playExpirySfx(state.run, settled);
  if (promotion.promoted) {
    playSfx('promotion');
  } else if (afterNetWorth - weekStartNetWorth > 0) {
    playSfx('profit');
  } else if (afterNetWorth - weekStartNetWorth < -100) {
    playSfx('loss');
  }
  const nextRun = checkBankruptcy({
    ...mondayRun,
    weekResult,
    weekOptionResults: [],
    weekFundamentalScore: 0,
    weekTechnicalScore: 0
  });
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
    nextSave = insertIntoHallOfFame(nextSave, {
      seed: nextRun.seed,
      endedAtWeek: nextRun.week,
      endedTier: nextRun.tier,
      endNetWorth: Math.round(afterNetWorth),
      endedInBankruptcy: true,
      endedAt: new Date().toISOString()
    });
  }

  // Check achievement unlocks (Friday week-end trigger + RUN_END if bankrupt).
  const weekTrigger = nextRun.isBankrupt && !state.run.isBankrupt ? 'RUN_END' : 'WEEK_END';
  const newUnlocks = checkAchievements(nextSave, nextRun, weekTrigger, weekResult);
  if (newUnlocks.length > 0) {
    nextSave = { ...nextSave, achievements: [...nextSave.achievements, ...newUnlocks] };
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
  return {
    ...after,
    fundamentalScore: after.fundamentalScore + 1,
    weekFundamentalScore: after.weekFundamentalScore + 1
  };
}

function tagTechnicalTrade(after: RunState, before: RunState, expiresDay: OptionExpiryDay): RunState {
  if (after.cash >= before.cash) return after;
  // Short-DTE option opens read as technical plays; FRI counts less.
  const score = expiresDay === 'FRI' ? 1 : 2;
  return {
    ...after,
    technicalScore: after.technicalScore + score,
    weekTechnicalScore: after.weekTechnicalScore + score
  };
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
  // If the player accepted an insider tip this week, force the shock to match.
  let event = rng.pick(eventDeck);
  if (run.activeInsiderTip) {
    const tipEvent = eventDeck.find((e) => e.id === run.activeInsiderTip!.eventId);
    if (tipEvent) event = tipEvent;
  }
  const targetedSymbol = run.activeInsiderTip ? run.activeInsiderTip.symbol : undefined;
  const impacted = targetedSymbol ?? event.symbol ?? run.tickers.find((ticker) => ticker.definition.sector === event.sector)?.definition.symbol ?? rng.pick(run.tickers).definition.symbol;
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
