import { getCareerGate } from '../career/careerEngine';
import { getNetWorth } from '../game/selectors';
import type { RunState } from '../game/types';

export interface WeeklyGoal {
  id: 'net-worth' | 'reputation' | 'xp';
  label: string;
  current: number;
  target: number;
  completed: boolean;
  description: string;
}

export function getWeeklyGoals(run: RunState): WeeklyGoal[] {
  const gate = getCareerGate(run.tier);
  const netWorth = Math.round(getNetWorth(run));

  return [
    {
      id: 'net-worth',
      label: `Reach $${gate.requiredNetWorth.toLocaleString()} net worth`,
      current: netWorth,
      target: gate.requiredNetWorth,
      completed: netWorth >= gate.requiredNetWorth,
      description: 'Cash plus marked shares'
    },
    {
      id: 'reputation',
      label: `Build street rep to ${gate.requiredReputation}`,
      current: run.reputation,
      target: gate.requiredReputation,
      completed: run.reputation >= gate.requiredReputation,
      description: 'Protect the week and win cleanly'
    },
    {
      id: 'xp',
      label: `Bank ${gate.requiredXp} XP lessons`,
      current: run.xp,
      target: gate.requiredXp,
      completed: run.xp >= gate.requiredXp,
      description: 'Survive expiries and learn'
    }
  ];
}
