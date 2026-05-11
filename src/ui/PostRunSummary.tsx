import type { RunState } from '../game/types';

export function PostRunSummary({ run, onRestart }: { run: RunState; onRestart: () => void }) {
  if (!run.isBankrupt) return null;

  return (
    <div className="summary-backdrop" role="dialog" aria-modal="true" aria-label="Post-run summary">
      <section className="summary-panel">
        <h2>Run Liquidated</h2>
        <p>You ran out of cash in week {run.week}. The bankroll is gone, but the market journal survives.</p>
        <button type="button" onClick={onRestart}>Start New Run</button>
      </section>
    </div>
  );
}
