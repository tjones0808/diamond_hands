import type { GameAction } from '../game/reducer';
import type { OptionStrategyType, RunState } from '../game/types';
import { groupResultsByStrategy } from '../week/weekRecap';

export function WeekRecap({ run, dispatch }: { run: RunState; dispatch: (action: GameAction) => void }) {
  const recap = run.weekResult;
  if (!recap || run.isBankrupt) return null;

  const trendClass = recap.netWorthDelta >= 0 ? 'gain' : 'loss';

  return (
    <div className="recap-backdrop" role="dialog" aria-modal="true" aria-label="Week recap">
      <section className="recap-panel">
        <header className="recap-head">
          <div>
            <span>Week {recap.week} Tape</span>
            <h2>{recap.headline}</h2>
          </div>
          <div className={`recap-pnl ${trendClass}`} aria-label="Net worth change">
            <small>Net worth</small>
            <strong>{formatSigned(recap.netWorthDelta)}</strong>
            <em>${recap.endNetWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })} total</em>
          </div>
        </header>

        {recap.optionResults.length > 0 ? (
          <section className="recap-options" aria-label="Option expiries">
            <h3>Option Expiries</h3>
            <ul>
              {groupResultsByStrategy(recap.optionResults).map((group) => (
                <li key={group.strategyId}>
                  <div className="recap-opt-row">
                    <span className="recap-opt-name">
                      <strong>{group.symbol}</strong> {strategyLabel(group.strategyType)} <em>{group.expiresDay}</em>
                    </span>
                    <span className="recap-opt-risk">Risked {formatMoney(Math.abs(group.totalRisk))}</span>
                    <span className={`recap-opt-pnl ${group.totalPnl >= 0 ? 'gain' : 'loss'}`}>
                      <strong>{formatSigned(group.totalPnl)}</strong>
                    </span>
                  </div>
                  {group.legs.length > 1 ? (
                    <ul className="recap-opt-legs">
                      {group.legs.map((leg, index) => (
                        <li key={`${leg.strategyId}-${index}`}>
                          {leg.side === 'SHORT' ? '−' : '+'}{leg.quantity} {leg.type} ${leg.strike}
                          <span className={leg.pnl >= 0 ? 'gain' : 'loss'}>{formatSigned(leg.pnl)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <section className="recap-options recap-options--empty" aria-label="No expiries">
            <p>No options on the book. Friday was quiet.</p>
          </section>
        )}

        {recap.eventTitle ? (
          <section className="recap-event">
            <small>Wednesday shock</small>
            <strong>{recap.eventTitle}{recap.eventSymbol ? ` · ${recap.eventSymbol}` : ''}</strong>
            <p>{recap.eventDescription}</p>
          </section>
        ) : null}

        <section className="recap-meta" aria-label="Week stats">
          <span><small>Cash</small><b className={recap.cashDelta >= 0 ? 'gain' : 'loss'}>{formatSigned(recap.cashDelta)}</b></span>
          <span><small>Reputation</small><b className={recap.reputationDelta >= 0 ? 'gain' : 'loss'}>{recap.reputationDelta >= 0 ? '+' : ''}{recap.reputationDelta}</b></span>
          <span><small>XP</small><b className="gain">+{recap.xpGained}</b></span>
          <span><small>Options P/L</small><b className={recap.optionsTotalPnl >= 0 ? 'gain' : 'loss'}>{formatSigned(recap.optionsTotalPnl)}</b></span>
        </section>

        {recap.bossResolution && recap.bossDefinition ? (
          <section
            className={recap.bossResolution.passed ? 'recap-boss recap-boss--passed' : 'recap-boss recap-boss--failed'}
            aria-label="Boss week resolution"
          >
            <header>
              <span>BOSS WEEK · {recap.bossDefinition.title}</span>
              <strong className={recap.bossResolution.passed ? 'gain' : 'loss'}>
                {recap.bossResolution.passed ? 'PASSED' : 'FAILED'}
              </strong>
            </header>
            <p>{recap.bossResolution.summary}</p>
            {!recap.bossResolution.passed ? (
              <small>Penalty: reputation {recap.bossResolution.reputationDelta}{recap.bossResolution.cashDelta ? `, cash ${formatSigned(recap.bossResolution.cashDelta)}` : ''}.</small>
            ) : null}
          </section>
        ) : null}

        {recap.balancedTrader ? (
          <section className="recap-balanced" aria-label="Balanced Trader bonus">
            <strong>BALANCED TRADER · +2 REPUTATION</strong>
            <span>You took {recap.weekFundamentalTrades ?? 0} fundamental {plural(recap.weekFundamentalTrades ?? 0, 'trade')} and {recap.weekTechnicalTrades ?? 0} technical {plural(recap.weekTechnicalTrades ?? 0, 'play')}. Profitable too. The street notices.</span>
          </section>
        ) : null}

        {recap.promoted && recap.promotedToTier ? (
          <section className="recap-promotion" aria-label="Promotion">
            <div className="recap-promotion-banner">
              <span>PROMOTION</span>
              <strong>{recap.promotedToTier.replaceAll('_', ' ')}</strong>
            </div>
            {recap.promotedFromTier ? (
              <div className="recap-promotion-track">
                <em>{recap.promotedFromTier.replaceAll('_', ' ')}</em>
                <span aria-hidden="true">→</span>
                <em className="next">{recap.promotedToTier.replaceAll('_', ' ')}</em>
              </div>
            ) : null}
            {recap.newArtifact ? (
              <div className="recap-promotion-artifact">
                <small>New trophy</small>
                <b>{recap.newArtifact.label}</b>
                <p>{recap.newArtifact.description}</p>
              </div>
            ) : null}
            {recap.nextRunPerk && (recap.nextRunPerk.bonusCash > 0 || recap.nextRunPerk.bonusReputation > 0) ? (
              <div className="recap-promotion-perk">
                <small>Next run starts with</small>
                <b>{recap.nextRunPerk.description}</b>
              </div>
            ) : null}
          </section>
        ) : null}

        <p className="recap-lesson">{recap.lesson}</p>

        <button type="button" onClick={() => dispatch({ type: 'DISMISS_RECAP' })}>
          Take Monday
        </button>
      </section>
    </div>
  );
}

function formatSigned(value: number) {
  const rounded = Math.round(value * 100) / 100;
  const sign = rounded >= 0 ? '+' : '-';
  return `${sign}$${Math.abs(rounded).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function plural(count: number, word: string) {
  return count === 1 ? word : `${word}s`;
}

function strategyLabel(type: OptionStrategyType) {
  switch (type) {
    case 'SINGLE_CALL': return 'CALL';
    case 'SINGLE_PUT': return 'PUT';
    case 'CALL_SPREAD': return 'CALL SPREAD';
    case 'PUT_SPREAD': return 'PUT SPREAD';
    case 'STRADDLE': return 'STRADDLE';
    case 'COVERED_CALL': return 'COVERED CALL';
  }
}

function formatMoney(value: number) {
  const rounded = Math.round(value * 100) / 100;
  return `$${rounded.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}
