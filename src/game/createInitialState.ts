import type { GameState, SaveState } from './types';
import { generateMarketWeek } from '../market/marketGenerator';

export function createInitialSave(): SaveState {
  return {
    unlocks: {
      betterNewsFeed: false,
      secondMonitor: false
    },
    bestNetWorth: 0,
    runsCompleted: 0
  };
}

export function createInitialGameState(seed = Date.now(), save = createInitialSave()): GameState {
  const market = generateMarketWeek(seed);

  return {
    save,
    run: {
      seed,
      week: 1,
      day: 'MON',
      tier: 'BEDROOM_DAY_TRADER',
      cash: 5000,
      reputation: 40,
      xp: 0,
      marketRegime: market.regime,
      tickers: market.tickers,
      sharePositions: [],
      optionPositions: [],
      isBankrupt: false,
      weekLog: ['You boot up your battered trading rig.']
    }
  };
}
