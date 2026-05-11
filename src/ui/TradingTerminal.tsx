import { useMemo, useState } from 'react';
import { getCareerGate } from '../career/careerEngine';
import type { GameAction } from '../game/reducer';
import type { RunState, SaveState, WeekDay } from '../game/types';
import { getCurrentPrice, getNetWorth } from '../game/selectors';
import { estimatePremium } from '../trading/options';
import { StockDetailPanel } from './StockDetailPanel';
import { TradeTicket } from './TradeTicket';
import { WeeklyGoals } from './WeeklyGoals';

const dayHelp: Record<WeekDay, string> = {
  MON: 'Read the market and choose a thesis.',
  TUE: 'Build positions before the midweek shock.',
  WED: 'A market shock has hit. Re-check risk.',
  THU: 'Double down, hedge, or preserve cash.',
  FRI: 'Advance to settle options and close the week.'
};

export function TradingTerminal({ run, save, dispatch }: { run: RunState; save: SaveState; dispatch: (action: GameAction) => void }) {
  const [symbol, setSymbol] = useState(run.tickers[0]?.definition.symbol ?? '');
  const currentPrice = getCurrentPrice(run, symbol);
  const ticker = run.tickers.find((item) => item.definition.symbol === symbol);
  const gate = getCareerGate(run.tier);
  const callStrike = Math.max(1, Math.round(currentPrice * 1.05));
  const putStrike = Math.max(1, Math.round(currentPrice * 0.95));
  const callPremium = useMemo(() => estimatePremium(currentPrice, callStrike, ticker?.definition.volatility ?? 0.1, 'CALL'), [currentPrice, callStrike, ticker]);
  const putPremium = useMemo(() => estimatePremium(currentPrice, putStrike, ticker?.definition.volatility ?? 0.1, 'PUT'), [currentPrice, putStrike, ticker]);

  return (
    <section className="terminal" aria-label="Trading terminal">
      <section className="market-column" aria-label="Market choices and log">
        <div className="watchlist" aria-label="Watchlist">
          {run.tickers.map((item) => {
            const price = getCurrentPrice(run, item.definition.symbol);
            const start = item.prices[0]?.price ?? price;
            const move = ((price - start) / start) * 100;
            const moveText = `${move >= 0 ? '+' : ''}${move.toFixed(1)}%`;
            return (
              <button className={item.definition.symbol === symbol ? 'ticker selected' : 'ticker'} key={item.definition.symbol} type="button" onClick={() => setSymbol(item.definition.symbol)}>
                <span className="ticker-symbol">{item.definition.symbol}</span>
                <em className={move >= 0 ? 'gain' : 'loss'}>{moveText}</em>
                <strong>${price.toFixed(2)}</strong>
              </button>
            );
          })}
        </div>

        <section className="log">
          <h2>Week Log</h2>
          <div className="log-lines">
            {run.weekLog.slice(-14).map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}
          </div>
        </section>
      </section>

      <section className={run.activeEvent ? 'controls-column has-event' : 'controls-column'} aria-label="Trading controls">
        <div className="terminal-header">
          <div>
            <h1>Trading Terminal</h1>
            <p>{dayHelp[run.day]}</p>
          </div>
          <button type="button" onClick={() => dispatch({ type: 'ADVANCE_DAY' })}>
            {run.day === 'FRI' ? 'Settle Expiry' : 'Advance Day'}
          </button>
        </div>

        {run.activeEvent ? (
          <article className="event-card">
            <strong>{run.activeEvent.title}</strong>
            <span>{run.activeEvent.description}</span>
          </article>
        ) : null}

        <StockDetailPanel ticker={ticker} currentPrice={currentPrice} />

        <TradeTicket
          symbol={symbol}
          currentPrice={currentPrice}
          callStrike={callStrike}
          putStrike={putStrike}
          callPremium={callPremium}
          putPremium={putPremium}
          volatility={ticker?.definition.volatility ?? 0.1}
          dispatch={dispatch}
        />

        <div className="progress-column">
          <WeeklyGoals run={run} />

          <section className="upgrade-card">
            <div className="upgrade-copy">
              <h2>{gate.nextTier ? `Next: ${gate.nextTier.replaceAll('_', ' ')}` : 'High-Rise Legend'}</h2>
              <p>{gate.roomLabel}. Buy tools, clear goals, climb after Friday expiry.</p>
            </div>
            <div className="upgrade-actions">
              <button type="button" disabled={save.unlocks.secondMonitor || run.cash < 750} onClick={() => dispatch({ type: 'UNLOCK_SECOND_MONITOR' })}>
                {save.unlocks.secondMonitor ? 'Monitor Installed' : 'Second Monitor $750'}
              </button>
              <button type="button" disabled={save.unlocks.betterNewsFeed || run.cash < 1200} onClick={() => dispatch({ type: 'UNLOCK_BETTER_NEWS_FEED' })}>
                {save.unlocks.betterNewsFeed ? 'Feed Active' : 'News Feed $1,200'}
              </button>
            </div>
          </section>
        </div>
      </section>

      <section className="positions">
        <div className="section-heading">
          <h2>Positions</h2>
          <span>Net worth ${Math.round(getNetWorth(run)).toLocaleString()}</span>
        </div>
        {run.sharePositions.length === 0 && run.optionPositions.length === 0 ? <p>No positions yet. The market is waiting.</p> : null}
        {run.sharePositions.map((position) => <p key={position.symbol}>{position.quantity} {position.symbol} shares @ ${position.averagePrice}</p>)}
        {run.optionPositions.map((option) => <p key={option.id}>{option.quantity} {option.symbol} {option.type} {option.strike}, premium ${option.premium}</p>)}
      </section>
    </section>
  );
}
