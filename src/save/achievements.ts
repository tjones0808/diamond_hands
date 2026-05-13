import type { AchievementUnlock, RunState, RunSummary, SaveState, WeekResult } from '../game/types';
import { achievementDefinitions } from '../content/achievements';

export function checkAchievements(
  save: SaveState,
  run: RunState,
  trigger: 'WEEK_END' | 'RUN_END' | 'TRADE',
  weekResult?: WeekResult
): AchievementUnlock[] {
  const alreadyUnlocked = new Set(save.achievements.map((a) => a.id));
  const newlyUnlocked: AchievementUnlock[] = [];
  const ctx = { run, save, weekResult, trigger };

  for (const def of achievementDefinitions) {
    if (alreadyUnlocked.has(def.id)) continue;
    try {
      if (def.check(ctx)) {
        newlyUnlocked.push({
          id: def.id,
          unlockedAt: new Date().toISOString(),
          unlockedAtWeek: run.week,
          unlockedAtTier: run.tier
        });
      }
    } catch {
      // never let a buggy achievement crash the reducer
    }
  }

  return newlyUnlocked;
}

const TOP_RUNS_MAX = 10;

export function insertIntoHallOfFame(save: SaveState, summary: RunSummary): SaveState {
  const next = [...save.topRuns, summary]
    .sort((a, b) => b.endNetWorth - a.endNetWorth)
    .slice(0, TOP_RUNS_MAX);
  return { ...save, topRuns: next };
}
