import type { LifetimeStats, RunState, RunSummary, SaveState, WeekResult } from '../game/types';

export function emptyStats(): LifetimeStats {
  return {
    totalRuns: 1,
    totalBankruptcies: 0,
    totalPromotions: 0,
    totalBossWeeksPassed: 0,
    totalBossWeeksFailed: 0,
    totalWeeksSurvived: 0,
    biggestSingleWeekGain: 0,
    biggestSingleWeekLoss: 0,
    totalFundamentalTrades: 0,
    totalTechnicalTrades: 0,
    totalBalancedWeeks: 0
  };
}

export function applyWeekResultToStats(stats: LifetimeStats, result: WeekResult): LifetimeStats {
  return {
    ...stats,
    totalWeeksSurvived: stats.totalWeeksSurvived + 1,
    totalPromotions: stats.totalPromotions + (result.promoted ? 1 : 0),
    totalBossWeeksPassed: stats.totalBossWeeksPassed + (result.bossResolution?.passed ? 1 : 0),
    totalBossWeeksFailed: stats.totalBossWeeksFailed + (result.bossResolution && !result.bossResolution.passed ? 1 : 0),
    biggestSingleWeekGain: Math.max(stats.biggestSingleWeekGain, result.netWorthDelta),
    biggestSingleWeekLoss: Math.min(stats.biggestSingleWeekLoss, result.netWorthDelta),
    totalFundamentalTrades: stats.totalFundamentalTrades + (result.weekFundamentalTrades ?? 0),
    totalTechnicalTrades: stats.totalTechnicalTrades + (result.weekTechnicalTrades ?? 0),
    totalBalancedWeeks: stats.totalBalancedWeeks + (result.balancedTrader ? 1 : 0)
  };
}

export function recordBankruptcy(stats: LifetimeStats): LifetimeStats {
  return { ...stats, totalBankruptcies: stats.totalBankruptcies + 1 };
}

export function appendRunSummary(save: SaveState, run: RunState, endNetWorth: number): SaveState {
  const summary: RunSummary = {
    seed: run.seed,
    endedAtWeek: run.week,
    endedTier: run.tier,
    endNetWorth: Math.round(endNetWorth),
    endedInBankruptcy: run.isBankrupt,
    endedAt: new Date().toISOString()
  };
  const trimmed = [summary, ...save.recentRuns].slice(0, 8);
  return { ...save, recentRuns: trimmed };
}
