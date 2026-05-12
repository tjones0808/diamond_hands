import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { SaveState } from '../game/types';
import { tierLabel } from '../content/tierRewards';

export function RunJournal({ save }: { save: SaveState }) {
  const [open, setOpen] = useState(false);
  const stats = save.stats;

  const modal = open ? (
    <div className="journal-backdrop" role="dialog" aria-modal="true" aria-label="Run journal" onClick={() => setOpen(false)}>
      <section className="journal-panel" onClick={(event) => event.stopPropagation()}>
            <header>
              <div>
                <span>Run Journal</span>
                <h2>Lifetime stats</h2>
              </div>
              <button type="button" aria-label="Close run journal" onClick={() => setOpen(false)}>✕</button>
            </header>

            <section className="journal-stats" aria-label="Lifetime stats">
              <Stat label="Runs played" value={stats.totalRuns.toString()} />
              <Stat label="Weeks survived" value={stats.totalWeeksSurvived.toString()} />
              <Stat label="Bankruptcies" value={stats.totalBankruptcies.toString()} />
              <Stat label="Promotions" value={stats.totalPromotions.toString()} />
              <Stat label="Boss weeks passed" value={stats.totalBossWeeksPassed.toString()} />
              <Stat label="Boss weeks failed" value={stats.totalBossWeeksFailed.toString()} />
              <Stat label="Best week" value={formatSigned(stats.biggestSingleWeekGain)} tone="gain" />
              <Stat label="Worst week" value={formatSigned(stats.biggestSingleWeekLoss)} tone="loss" />
              <Stat label="Best net worth" value={`$${Math.round(save.bestNetWorth).toLocaleString()}`} />
              <Stat label="Highest tier" value={tierLabel(save.highestTier)} />
              <Stat
                label="Trading style"
                value={tradingStyleLabel(stats.totalFundamentalTrades, stats.totalTechnicalTrades)}
              />
              <Stat label="Balanced weeks" value={stats.totalBalancedWeeks.toString()} />
            </section>

            <section className="journal-recent" aria-label="Recent runs">
              <h3>Recent runs</h3>
              {save.recentRuns.length === 0 ? (
                <p className="journal-empty">No completed runs yet. Bankruptcy or a graceful end will appear here.</p>
              ) : (
                <ul>
                  {save.recentRuns.map((run, index) => (
                    <li key={`${run.seed}-${run.endedAt}-${index}`}>
                      <strong>W{run.endedAtWeek}</strong>
                      <span>{tierLabel(run.endedTier)}</span>
                      <em className={run.endedInBankruptcy ? 'loss' : 'gain'}>
                        {run.endedInBankruptcy ? 'Bankrupt' : 'Continued'}
                      </em>
                      <b>${run.endNetWorth.toLocaleString()}</b>
                    </li>
                  ))}
                </ul>
              )}
        </section>
      </section>
    </div>
  ) : null;

  return (
    <>
      <button type="button" className="journal-toggle" aria-label="Open run journal" onClick={() => setOpen(true)}>
        📓 Journal
      </button>
      {modal && typeof document !== 'undefined' ? createPortal(modal, document.body) : null}
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'gain' | 'loss' }) {
  return (
    <span>
      <small>{label}</small>
      <b className={tone}>{value}</b>
    </span>
  );
}

function tradingStyleLabel(fundamental: number, technical: number) {
  const total = fundamental + technical;
  if (total === 0) return '—';
  const fpct = Math.round((fundamental / total) * 100);
  const tpct = 100 - fpct;
  if (fpct >= 70) return `Fundamental ${fpct}%`;
  if (tpct >= 70) return `Technical ${tpct}%`;
  return `${fpct}F / ${tpct}T`;
}

function formatSigned(value: number) {
  const rounded = Math.round(value);
  if (rounded === 0) return '$0';
  const sign = rounded >= 0 ? '+' : '-';
  return `${sign}$${Math.abs(rounded).toLocaleString()}`;
}
