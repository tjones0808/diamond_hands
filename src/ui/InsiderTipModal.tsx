import { createPortal } from 'react-dom';
import type { GameAction } from '../game/reducer';
import type { RunState } from '../game/types';

export function InsiderTipModal({ run, dispatch }: { run: RunState; dispatch: (action: GameAction) => void }) {
  const tip = run.pendingInsiderTip;
  if (!tip) return null;
  if (typeof document === 'undefined') return null;

  const arrow = tip.expectedDirection === 'UP' ? '↑' : '↓';

  const modal = (
    <div className="tip-backdrop" role="dialog" aria-modal="true" aria-label="Insider tip">
      <section className="tip-panel">
        <header>
          <span>INSIDER TIP</span>
          <h2>{tip.symbol} {arrow}</h2>
        </header>
        <p className="tip-source">From {tip.source}.</p>
        <p className="tip-body">
          They claim <b>{tip.eventTitle}</b> hits the tape on Wednesday — they say {tip.symbol} will move <strong>{tip.expectedDirection.toLowerCase()}</strong> hard.
        </p>
        <ul className="tip-tradeoffs">
          <li><b>Upside:</b> guaranteed direction on Wednesday's shock. Trade ahead of it.</li>
          <li className="loss"><b>Risk:</b> ~22% chance the SEC opens an investigation Friday. Fine + reputation hit.</li>
        </ul>
        <div className="tip-actions">
          <button type="button" className="tip-accept" onClick={() => dispatch({ type: 'ACCEPT_INSIDER_TIP' })}>
            Take the tip
          </button>
          <button type="button" className="tip-decline" onClick={() => dispatch({ type: 'DECLINE_INSIDER_TIP' })}>
            Walk away
          </button>
        </div>
      </section>
    </div>
  );

  return createPortal(modal, document.body);
}

export function SecInvestigationModal({ run, dispatch }: { run: RunState; dispatch: (action: GameAction) => void }) {
  const inv = run.secInvestigation;
  if (!inv) return null;
  if (typeof document === 'undefined') return null;

  const modal = (
    <div className="tip-backdrop" role="dialog" aria-modal="true" aria-label="SEC investigation">
      <section className="tip-panel sec">
        <header>
          <span>SEC NOTICE</span>
          <h2>You got caught.</h2>
        </header>
        <p className="tip-body">
          The Wall Street Journal posted "ongoing SEC review" of unusual options activity tied to a tip you acted on.
        </p>
        <ul className="tip-tradeoffs">
          <li className="loss"><b>Fine:</b> ${inv.fineAmount.toFixed(2)} debited from cash.</li>
          <li className="loss"><b>Reputation:</b> -{inv.reputationHit} on the street.</li>
        </ul>
        <div className="tip-actions">
          <button type="button" className="tip-decline" onClick={() => dispatch({ type: 'DISMISS_SEC_INVESTIGATION' })}>
            Lawyer up. Continue.
          </button>
        </div>
      </section>
    </div>
  );

  return createPortal(modal, document.body);
}
