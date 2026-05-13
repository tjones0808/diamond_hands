import { createPortal } from 'react-dom';
import type { GameAction } from '../game/reducer';
import type { RunState } from '../game/types';

export function LpReviewModal({ run, dispatch }: { run: RunState; dispatch: (action: GameAction) => void }) {
  const review = run.pendingLpReview;
  if (!review) return null;
  if (typeof document === 'undefined') return null;

  const trailingPct = review.trailingPerformancePct * 100;
  const benchmarkPct = review.benchmarkPct * 100;

  const modal = (
    <div className="lp-backdrop" role="dialog" aria-modal="true" aria-label="LP quarterly review">
      <section className={review.passed ? 'lp-panel lp-passed' : 'lp-panel lp-failed'}>
        <header>
          <span>LP QUARTERLY REVIEW</span>
          <h2>{review.headline}</h2>
        </header>

        <div className="lp-metrics">
          <span>
            <small>Trailing 4-week return</small>
            <b className={trailingPct >= 0 ? 'gain' : 'loss'}>
              {trailingPct >= 0 ? '+' : ''}{trailingPct.toFixed(2)}%
            </b>
          </span>
          <span>
            <small>LP benchmark</small>
            <b>+{benchmarkPct.toFixed(2)}%</b>
          </span>
          <span>
            <small>Verdict</small>
            <b className={review.passed ? 'gain' : 'loss'}>
              {review.passed ? 'PASSED' : 'TRAILING'}
            </b>
          </span>
        </div>

        <p className="lp-body">{review.body}</p>

        <ul className="lp-effects">
          <li className={review.clientBalanceMultiplier >= 0 ? 'gain' : 'loss'}>
            Client balances: {review.clientBalanceMultiplier >= 0 ? '+' : ''}{(review.clientBalanceMultiplier * 100).toFixed(0)}%
          </li>
          <li className={review.reputationDelta >= 0 ? 'gain' : 'loss'}>
            Reputation: {review.reputationDelta >= 0 ? '+' : ''}{review.reputationDelta}
          </li>
        </ul>

        <button type="button" className="lp-ack" onClick={() => dispatch({ type: 'ACKNOWLEDGE_LP_REVIEW' })}>
          Acknowledge and continue
        </button>
      </section>
    </div>
  );

  return createPortal(modal, document.body);
}
