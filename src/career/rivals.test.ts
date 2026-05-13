import { describe, expect, it } from 'vitest';
import { createRng } from '../simulation/rng';
import { buildLeaderboard, generateRivals, pickRivalReaction, tickRivalsForWeek } from './rivals';
import type { Rival, RunState } from '../game/types';

const minimalRun = (overrides: Partial<RunState> = {}): RunState => ({
  seed: 1, week: 1, day: 'MON', tier: 'BEDROOM_DAY_TRADER',
  cash: 5000, reputation: 40, xp: 0, marketRegime: 'CALM',
  tickers: [], sharePositions: [], optionPositions: [], isBankrupt: false,
  weekLog: [], weekOptionResults: [],
  fundamentalScore: 0, technicalScore: 0, weekFundamentalScore: 0, weekTechnicalScore: 0,
  stress: 0, confidence: 0, marginUsed: 0, tickerSeries: {},
  weekStartNetWorth: 5000, weekStartCash: 5000, restingOrders: [], clients: [],
  dayStartNetWorth: 5000, dailyLossStrikes: 0, rivals: [], lpNetWorthHistory: [],
  ...overrides
});

describe('generateRivals', () => {
  it('produces 3 distinct rivals from the pool', () => {
    const rivals = generateRivals(createRng(42));
    expect(rivals).toHaveLength(3);
    const ids = new Set(rivals.map((r) => r.id));
    expect(ids.size).toBe(3);
  });

  it('seeds each rival at the starting balance', () => {
    const rivals = generateRivals(createRng(99));
    for (const rival of rivals) {
      expect(rival.balance).toBe(rival.startingBalance);
      expect(rival.lastWeekPct).toBe(0);
    }
  });
});

describe('tickRivalsForWeek', () => {
  it('walks each rivals balance and records lastWeekPct', () => {
    const before = generateRivals(createRng(2026));
    const after = tickRivalsForWeek(before, createRng(2027));
    expect(after).toHaveLength(before.length);
    for (let i = 0; i < after.length; i += 1) {
      expect(after[i].balance).not.toBe(before[i].balance);
    }
  });
});

describe('buildLeaderboard', () => {
  it('places the player and rivals ordered by balance', () => {
    const rivals: Rival[] = [
      { id: 'marco', name: 'Marco', personality: 'AGGRESSIVE', balance: 12000, startingBalance: 5000, lastWeekPct: 5, bestWeekPct: 12 },
      { id: 'beth', name: 'Beth', personality: 'CAUTIOUS', balance: 5500, startingBalance: 5000, lastWeekPct: 1, bestWeekPct: 3 }
    ];
    const board = buildLeaderboard(minimalRun({ rivals }), 8000, 5000);
    expect(board).toHaveLength(3);
    expect(board[0].name).toBe('Marco');
    expect(board[1].name).toBe('You');
    expect(board[2].name).toBe('Beth');
    expect(board[0].rank).toBe(1);
    expect(board[1].isPlayer).toBe(true);
  });
});

describe('pickRivalReaction', () => {
  it('jeers when the player has a big loss week', () => {
    const rival = generateRivals(createRng(1))[0];
    expect(pickRivalReaction(rival, -10)?.line.length).toBeGreaterThan(0);
  });

  it('cheers when the player has a big win week', () => {
    const rival = generateRivals(createRng(1))[0];
    expect(pickRivalReaction(rival, 15)?.line.length).toBeGreaterThan(0);
  });

  it('returns undefined on a flat week with no rival news', () => {
    const rival = generateRivals(createRng(1))[0];
    expect(pickRivalReaction(rival, 1)).toBeUndefined();
  });
});
