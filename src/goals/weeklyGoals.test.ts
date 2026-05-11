import { describe, expect, it } from 'vitest';
import { getWeeklyGoals } from './weeklyGoals';
import { createInitialGameState } from '../game/createInitialState';
import type { RunState } from '../game/types';

describe('getWeeklyGoals', () => {
  it('tracks career-gate goals for the current week', () => {
    const run = createInitialGameState(20260508).run;

    const goals = getWeeklyGoals(run);

    expect(goals.map((goal) => goal.id)).toEqual(['net-worth', 'reputation', 'xp']);
    expect(goals[0]).toMatchObject({
      label: 'Reach $6,000 net worth',
      current: 5000,
      target: 6000,
      completed: false
    });
  });

  it('marks goals complete when the run clears the next gate requirements', () => {
    const run: RunState = {
      ...createInitialGameState(20260508).run,
      cash: 6500,
      reputation: 42,
      xp: 4
    };

    const goals = getWeeklyGoals(run);

    expect(goals.every((goal) => goal.completed)).toBe(true);
  });
});
