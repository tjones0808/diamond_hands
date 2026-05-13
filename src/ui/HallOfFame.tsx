import { createPortal } from 'react-dom';
import type { SaveState } from '../game/types';
import { tierLabel } from '../content/tierRewards';

export function HallOfFame({ save, onClose }: { save: SaveState; onClose: () => void }) {
  if (typeof document === 'undefined') return null;

  const modal = (
    <div className="hof-backdrop" role="dialog" aria-modal="true" aria-label="Hall of Fame" onClick={onClose}>
      <section className="hof-panel" onClick={(event) => event.stopPropagation()}>
        <header>
          <div>
            <span>Hall of Fame</span>
            <h2>Your top 10 runs</h2>
          </div>
          <button type="button" aria-label="Close" onClick={onClose}>✕</button>
        </header>

        {save.topRuns.length === 0 ? (
          <p className="hof-empty">No completed runs yet. A bankruptcy or graceful exit will land you on the board.</p>
        ) : (
          <ol className="hof-list">
            {save.topRuns.map((run, index) => (
              <li key={`${run.seed}-${run.endedAt}-${index}`}>
                <strong>#{index + 1}</strong>
                <div className="hof-meta">
                  <b>${run.endNetWorth.toLocaleString()}</b>
                  <span>{tierLabel(run.endedTier)}</span>
                </div>
                <div className="hof-detail">
                  <em>W{run.endedAtWeek}</em>
                  <span className={run.endedInBankruptcy ? 'loss' : 'gain'}>
                    {run.endedInBankruptcy ? 'Bankrupt' : 'Continued'}
                  </span>
                  <small>seed {run.seed}</small>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );

  return createPortal(modal, document.body);
}
