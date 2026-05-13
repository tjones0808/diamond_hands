import type { GameState, SaveState } from './types';
import { generateInitialMarketState } from '../market/marketGenerator';
import { getStartingPerk } from '../content/tierRewards';
import { emptyStats } from '../save/runJournal';
import { generateRivals } from '../career/rivals';
import { createRng } from '../simulation/rng';
import { maybeOfferTip } from '../career/insiderTips';

export function createInitialSave(): SaveState {
  return {
    unlocks: {
      betterNewsFeed: false,
      secondMonitor: false
    },
    bestNetWorth: 0,
    runsCompleted: 0,
    hasCompletedTutorial: false,
    tiersEverReached: ['BEDROOM_DAY_TRADER'],
    highestTier: 'BEDROOM_DAY_TRADER',
    audioMuted: false,
    stats: emptyStats(),
    recentRuns: [],
    settings: {
      sfxVolume: 0.5,
      musicVolume: 0.22,
      reducedMotion: false,
      colorBlindPalette: false
    },
    achievements: [],
    topRuns: []
  };
}

export function createInitialGameState(seed = Date.now(), save = createInitialSave()): GameState {
  const market = generateInitialMarketState(seed);
  const perk = getStartingPerk(save.highestTier);

  const state: GameState = {
    effects: [],
    save,
    run: {
      seed,
      week: 1,
      day: 'MON',
      tier: 'BEDROOM_DAY_TRADER',
      cash: 5000 + perk.bonusCash,
      reputation: 40 + perk.bonusReputation,
      xp: 0,
      marketRegime: market.regime,
      tickers: market.tickers,
      sharePositions: [],
      optionPositions: [],
      isBankrupt: false,
      weekLog: perk.bonusCash > 0 || perk.bonusReputation > 0
        ? ['You boot up your battered trading rig.', perk.description]
        : ['You boot up your battered trading rig.'],
      weekOptionResults: [],
      fundamentalScore: 0,
      technicalScore: 0,
      weekFundamentalScore: 0,
      weekTechnicalScore: 0,
      stress: 0,
      confidence: 0,
      marginUsed: 0,
      tickerSeries: market.tickerSeries,
      weekStartNetWorth: 5000 + perk.bonusCash,
      weekStartCash: 5000 + perk.bonusCash,
      restingOrders: [],
      clients: [],
      dayStartNetWorth: 5000 + perk.bonusCash,
      dailyLossStrikes: 0,
      rivals: generateRivals(createRng(seed + 313)),
      lpNetWorthHistory: [5000 + perk.bonusCash]
    }
  };

  const tip = maybeOfferTip(state.run);
  if (tip) state.run.pendingInsiderTip = tip;
  return state;
}
