import type { Client, RunState } from '../game/types';
import { getRedemptionThresholdPct, getWeeklyFeeRate } from '../career/clientPortfolio';

export function ClientPanel({ run }: { run: RunState }) {
  if (run.clients.length === 0) return null;

  const totalAum = run.clients.reduce((sum, c) => sum + c.balance, 0);
  const weeklyFeeProjection = run.clients.reduce((sum, c) => sum + c.balance * getWeeklyFeeRate(c.riskTolerance), 0);

  return (
    <section className="client-panel" aria-label="Clients">
      <div className="section-heading">
        <h2>Clients</h2>
        <span>
          AUM ${Math.round(totalAum).toLocaleString()} · fees +${weeklyFeeProjection.toFixed(0)}/wk
        </span>
      </div>
      <ul>
        {run.clients.map((client) => (
          <li key={client.id} className={clientToneClass(client)}>
            <header>
              <strong>{client.name}</strong>
              <span className={`client-risk ${client.riskTolerance.toLowerCase()}`}>
                {client.riskTolerance}
              </span>
            </header>
            <p className="client-backstory">{client.backstory}</p>
            <div className="client-metrics">
              <span>
                <small>Balance</small>
                <b className={client.balance >= client.startingBalance ? 'gain' : 'loss'}>
                  ${Math.round(client.balance).toLocaleString()}
                </b>
              </span>
              <span>
                <small>Drawdown</small>
                <b>{drawdownLabel(client)}</b>
              </span>
              <span>
                <small>Patience</small>
                <div className="client-patience" aria-label={`Patience ${client.patience}/100`}>
                  <i style={{ width: `${client.patience}%` }} />
                </div>
              </span>
            </div>
            <small className="client-redemption-hint">
              Redeems at {Math.round(getRedemptionThresholdPct(client.riskTolerance) * 100)}% drawdown.
            </small>
          </li>
        ))}
      </ul>
    </section>
  );
}

function clientToneClass(client: Client) {
  if (client.patience <= 25) return 'client-card warning';
  if (client.patience >= 80) return 'client-card happy';
  return 'client-card';
}

function drawdownLabel(client: Client) {
  if (client.startingBalance <= 0) return '0%';
  const pct = ((client.balance - client.startingBalance) / client.startingBalance) * 100;
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
}
