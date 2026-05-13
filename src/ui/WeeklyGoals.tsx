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
          const progress = Math.min(100, Math.round((goal.current / Math.max(1, goal.target)) * 100));
          return (
            <div className={goal.completed ? 'goal-row complete' : 'goal-row'} key={goal.id}>
              <div className="goal-head">
                <strong>{goal.label}</strong>
                <span className="goal-progress-text">
                  {formatGoalValue(goal.current)} <em>/</em> {formatGoalValue(goal.target)}
                </span>
              </div>
              <small className="goal-description">{goal.description}</small>
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
