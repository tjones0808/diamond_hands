import { useState } from 'react';
import type { MarketTicker, WeekDay } from '../game/types';
import { computeTechnicals } from '../market/technicals';
import { CandlestickChart } from './CandlestickChart';

interface StockDetailPanelProps {
  ticker?: MarketTicker;
  currentPrice: number;
  currentDay: WeekDay;
}

type Tab = 'chart' | 'fundamentals' | 'technicals';

export function StockDetailPanel({ ticker, currentPrice, currentDay }: StockDetailPanelProps) {
  const [tab, setTab] = useState<Tab>('chart');

  if (!ticker) {
    return (
      <article className="signal-card stock-detail-panel">
        <div>
          <h2>Stock Intel</h2>
          <p>Select a ticker to light up the feed.</p>
        </div>
      </article>
    );
  }

  const fundamentals = ticker.definition.fundamentals;
  const startPrice = ticker.prices[0]?.close ?? currentPrice;
  const move = startPrice > 0 ? ((currentPrice - startPrice) / startPrice) * 100 : 0;
  const quality = Math.round(ticker.definition.quality * 100);
  const volatility = Math.round(ticker.definition.volatility * 100);
  const technicals = computeTechnicals(ticker.prices, currentDay);

  return (
    <article className="signal-card stock-detail-panel">
      <div className="stock-detail-head">
        <div className="stock-detail-id">
          <strong>{ticker.definition.symbol}</strong>
          <em>{ticker.definition.sector}</em>
          {fundamentals.earningsThisWeek ? <span className="earnings-tag active">EARN WK</span> : null}
        </div>
        <div className="stock-detail-price">
          <b>${currentPrice.toFixed(2)}</b>
          <em className={move >= 0 ? 'gain' : 'loss'}>{move >= 0 ? '+' : ''}{move.toFixed(1)}%</em>
        </div>
      </div>

      <nav className="stock-detail-tabs" role="tablist" aria-label="Stock intel tabs">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'chart'}
          className={tab === 'chart' ? 'active' : ''}
          onClick={() => setTab('chart')}
        >
          Chart
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'fundamentals'}
          className={tab === 'fundamentals' ? 'active' : ''}
          onClick={() => setTab('fundamentals')}
        >
          Fundamentals
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'technicals'}
          className={tab === 'technicals' ? 'active' : ''}
          onClick={() => setTab('technicals')}
        >
          Technicals
        </button>
      </nav>

      <div className="stock-detail-body" role="tabpanel">
        {tab === 'chart' ? (
          <div className="chart-pane">
            <CandlestickChart prices={ticker.prices} currentDay={currentDay} />
            <ul className="chart-legend">
              <li><i className="dot gain" /> Up day (close ≥ open)</li>
              <li><i className="dot loss" /> Down day (close &lt; open)</li>
              <li><i className="dot muted" /> Future days dim until they happen</li>
            </ul>
          </div>
        ) : null}

        {tab === 'fundamentals' ? (
          <div className="fund-pane">
            <Stat label="P/E Ratio" value={fundamentals.peRatio === 0 ? 'N/A' : fundamentals.peRatio.toString()} tip="Price-to-Earnings. Lower can mean cheap, but quality and growth matter more than the number alone. N/A means no earnings yet (often biotech)." />
            <Stat label="Market Cap" value={fundamentals.marketCap} tip="Small/Mid/Large/Mega. Smaller caps move faster but carry more risk per shock." />
            <Stat label="Revenue Growth" value={`${fundamentals.revenueGrowth >= 0 ? '+' : ''}${fundamentals.revenueGrowth}%`} tip="Year-over-year revenue change. Growing companies often justify a higher P/E." tone={fundamentals.revenueGrowth >= 0 ? 'gain' : 'loss'} />
            <Stat label="Dividend Yield" value={`${fundamentals.dividendYield.toFixed(1)}%`} tip="Annual payout as a percent of price. Higher yield often signals mature, lower-growth names." />
            <Stat label="Signal Quality" value={`${quality}%`} tip="How trustworthy this ticker's tape is. Higher quality = headlines and signals line up with price action." />
            <Stat label="Volatility" value={`${volatility}%`} tip="Daily move range. Higher volatility means bigger option premiums but more risk." />
          </div>
        ) : null}

        {tab === 'technicals' ? (
          <div className="tech-pane">
            <Stat label="Trend" value={technicals.trend} tip="Direction of the week so far. Bullish trend favors long calls and call spreads; bearish favors puts and put spreads." tone={technicals.trend === 'UP' ? 'gain' : technicals.trend === 'DOWN' ? 'loss' : undefined} />
            <Stat label="Momentum" value={`${technicals.momentumPct >= 0 ? '+' : ''}${technicals.momentumPct}%`} tip="Percent change from week open to current close. Strong momentum often continues into Friday." tone={technicals.momentumPct >= 0 ? 'gain' : 'loss'} />
            <Stat label="Moving Average" value={`$${technicals.movingAverage.toFixed(2)}`} tip="Average close over the visible days. Price above MA usually confirms an uptrend." />
            <Stat label="Support" value={`$${technicals.support.toFixed(2)}`} tip="Lowest low so far this week. Breaks below this level often see further selling." />
            <Stat label="Resistance" value={`$${technicals.resistance.toFixed(2)}`} tip="Highest high so far this week. Closing above it often triggers continuation buying." />
            <Stat label="RSI" value={technicals.rsi.toString()} tip="Relative Strength: 0–100. Above 70 hints overbought (consider puts), below 30 oversold (consider calls)." tone={technicals.rsi >= 70 ? 'loss' : technicals.rsi <= 30 ? 'gain' : undefined} />
            <Stat label="Avg Volume" value={technicals.averageVolume.toLocaleString()} tip="Liquidity proxy. High volume during a move makes the signal more reliable." />
          </div>
        ) : null}
      </div>
    </article>
  );
}

function Stat({ label, value, tip, tone }: { label: string; value: string; tip: string; tone?: 'gain' | 'loss' }) {
  return (
    <span className="intel-stat" title={tip}>
      <small>{label}</small>
      <b className={tone}>{value}</b>
    </span>
  );
}
