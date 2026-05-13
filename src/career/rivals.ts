import type { Rival, RivalPersonality, RunState } from '../game/types';
import { rivalPool } from '../content/rivalPool';
import type { Rng } from '../simulation/rng';

interface PersonalityProfile {
  meanReturn: number;
  stddev: number;
}

const personalityProfile: Record<RivalPersonality, PersonalityProfile> = {
  AGGRESSIVE:   { meanReturn: 0.04, stddev: 0.12 },
  CAUTIOUS:     { meanReturn: 0.012, stddev: 0.03 },
  DISCIPLINED:  { meanReturn: 0.022, stddev: 0.05 }
};

const STARTING_BALANCE = 5000;
const RIVAL_COUNT = 3;

export function generateRivals(rng: Rng): Rival[] {
  const shuffled = [...rivalPool].sort(() => rng.next() - 0.5);
  return shuffled.slice(0, RIVAL_COUNT).map((template) => ({
    id: template.id,
    name: template.name,
    personality: template.personality,
    balance: STARTING_BALANCE,
    startingBalance: STARTING_BALANCE,
    lastWeekPct: 0,
    bestWeekPct: 0
  }));
}

/** Each rival walks their balance forward by a random sample from their personality. */
export function tickRivalsForWeek(rivals: Rival[], rng: Rng): Rival[] {
  return rivals.map((rival) => {
    const profile = personalityProfile[rival.personality];
    // Box-Muller-ish sample using two uniforms
    const u1 = Math.max(0.0001, rng.next());
    const u2 = rng.next();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const weekReturn = profile.meanReturn + profile.stddev * z;
    const newBalance = Math.max(100, rival.balance * (1 + weekReturn));
    return {
      ...rival,
      balance: roundMoney(newBalance),
      lastWeekPct: round1(weekReturn * 100),
      bestWeekPct: weekReturn * 100 > rival.bestWeekPct ? round1(weekReturn * 100) : rival.bestWeekPct
    };
  });
}

export interface LeaderboardRow {
  id: string;
  name: string;
  balance: number;
  pct: number; // % vs starting balance
  rank: number;
  isPlayer: boolean;
}

export function buildLeaderboard(run: RunState, playerNetWorth: number, playerStartingBalance: number): LeaderboardRow[] {
  const rows: Omit<LeaderboardRow, 'rank'>[] = [];
  rows.push({
    id: 'player',
    name: 'You',
    balance: roundMoney(playerNetWorth),
    pct: pctOf(playerNetWorth, playerStartingBalance),
    isPlayer: true
  });
  for (const rival of run.rivals) {
    rows.push({
      id: rival.id,
      name: rival.name,
      balance: rival.balance,
      pct: pctOf(rival.balance, rival.startingBalance),
      isPlayer: false
    });
  }
  rows.sort((a, b) => b.balance - a.balance);
  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
}

export function pickRivalReaction(rival: Rival, playerWeekPct: number): { template: typeof rivalPool[number]; line: string } | undefined {
  const template = rivalPool.find((t) => t.id === rival.id);
  if (!template) return undefined;
  if (playerWeekPct <= -8) return { template, line: template.jeer };
  if (playerWeekPct >= 10) return { template, line: template.cheer };
  if (rival.lastWeekPct >= 10) return { template, line: template.brag };
  return undefined;
}

function pctOf(value: number, starting: number) {
  if (starting <= 0) return 0;
  return round1(((value - starting) / starting) * 100);
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
