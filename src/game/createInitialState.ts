import type { GameState, SaveState } from './types';
import { generateMarketWeek } from '../market/marketGenerator';
import { getStartingPerk } from '../content/tierRewards';
import { emptyStats } from '../save/runJournal';

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
    recentRuns: []
  };
}

export function createInitialGameState(seed = Date.now(), save = createInitialSave()): GameState {
  const market = generateMarketWeek(seed);
  const perk = getStartingPerk(save.highestTier);

  return {
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
      technicalScore: 0
    }
  };
}
