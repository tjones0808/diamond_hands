import type { RunState } from '../game/types';
import { getNetWorth } from '../game/selectors';

export function BossWeekBanner({ run }: { run: RunState }) {
  if (!run.bossWeek) return null;

  const boss = run.bossWeek.definition;
  const netWorth = Math.round(getNetWorth(run));
  const progress = Math.min(100, Math.round((netWorth / boss.netWorthTarget) * 100));
  const remaining = Math.max(0, boss.netWorthTarget - netWorth);

  return (
    <section className="boss-banner" aria-label="Boss week">
      <header>
        <span>BOSS WEEK</span>
        <strong>{boss.title}</strong>
      </header>
      <p>{boss.intro}</p>
      <div className="boss-progress">
        <div className="boss-progress-bar" aria-hidden="true">
          <i style={{ width: `${progress}%` }} />
        </div>
        <span>
          <b>${netWorth.toLocaleString()}</b> / ${boss.netWorthTarget.toLocaleString()}
        </span>
        <em>{remaining > 0 ? `Need +$${remaining.toLocaleString()}` : 'Target hit — hold it through Friday.'}</em>
      </div>
    </section>
  );
}
