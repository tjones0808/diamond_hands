import { getWeeklyGoals } from '../goals/weeklyGoals';
import type { RunState } from '../game/types';

export function WeeklyGoals({ run }: { run: RunState }) {
  const goals = getWeeklyGoals(run);

  return (
    <section className="weekly-goals" aria-label="Weekly goals">
      <div className="section-heading">
        <h2>Weekly Goals</h2>
        <span>Gate</span>
      </div>
      <div className="goal-list">
        {goals.map((goal) => {
          const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
          return (
            <div className={goal.completed ? 'goal-row complete' : 'goal-row'} key={goal.id}>
              <div>
                <strong>{goal.label}</strong>
                <small>{goal.description}</small>
              </div>
              <span>{formatGoalValue(goal.current)} / {formatGoalValue(goal.target)}</span>
              <div className="goal-meter" aria-hidden="true">
                <i style={{ width: `${progress}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function formatGoalValue(value: number) {
  return value >= 1000 ? `$${Math.round(value).toLocaleString()}` : `${Math.round(value)}`;
}
