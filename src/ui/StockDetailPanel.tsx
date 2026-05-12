import { useState } from 'react';
import type { AnalystRating, MarketTicker, SaveState, WeekDay } from '../game/types';
import { computeTechnicals } from '../market/technicals';
import { CandlestickChart } from './CandlestickChart';

interface StockDetailPanelProps {
  ticker?: MarketTicker;
  currentPrice: number;
  currentDay: WeekDay;
  save: SaveState;
}

type Tab = 'fundamentals' | 'technicals' | 'news';

const dayOrder: WeekDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

export function StockDetailPanel({ ticker, currentPrice, currentDay, save }: StockDetailPanelProps) {
  const [tab, setTab] = useState<Tab>('fundamentals');

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
  const snapshot = ticker.snapshot;
  const startPrice = ticker.prices[0]?.close ?? currentPrice;
  const move = startPrice > 0 ? ((currentPrice - startPrice) / startPrice) * 100 : 0;
  const quality = Math.round(ticker.definition.quality * 100);
  const volatility = Math.round(ticker.definition.volatility * 100);
  const technicals = computeTechnicals(ticker.prices, currentDay);

  // Derived metrics
  const range = Math.max(0.01, snapshot.fiftyTwoWeekHigh - snapshot.fiftyTwoWeekLow);
  const rangePosition = ((currentPrice - snapshot.fiftyTwoWeekLow) / range) * 100;
  const distanceFromMa = technicals.movingAverage > 0
    ? ((currentPrice - technicals.movingAverage) / technicals.movingAverage) * 100
    : 0;
  const analystTargetPrice = currentPrice * (1 + snapshot.analystTargetPct / 100);
  const eps = fundamentals.peRatio > 0 ? currentPrice / fundamentals.peRatio : 0;

  // ATR-ish: average daily true range over visible bars
  const visibleBars = [...ticker.priorHistory, ...ticker.prices.filter((_, i) => i <= dayOrder.indexOf(currentDay))];
  const atr = visibleBars.length > 0
    ? visibleBars.reduce((total, bar) => total + (bar.high - bar.low), 0) / visibleBars.length
    : 0;

  // Relative volume: today's vs average
  const todayBar = ticker.prices.find((p) => p.day === currentDay);
  const relativeVolume = todayBar && technicals.averageVolume > 0
    ? todayBar.volume / technicals.averageVolume
    : 1;

  // Beta-ish: rough proxy from volatility (where 1.0 = market average ~10% vol)
  const beta = +(ticker.definition.volatility / 0.1).toFixed(2);

  return (
    <article className="signal-card stock-detail-panel">
      <div className="stock-detail-head">
        <div className="stock-detail-id">
          <strong>{ticker.definition.symbol}</strong>
          <em>{ticker.definition.sector}</em>
          <RatingPill rating={snapshot.analystRating} target={snapshot.analystTargetPct} />
          {fundamentals.earningsThisWeek ? <span className="earnings-tag active">EARN WK</span> : null}
        </div>
        <div className="stock-detail-price">
          <b>${currentPrice.toFixed(2)}</b>
          <em className={move >= 0 ? 'gain' : 'loss'}>{move >= 0 ? '+' : ''}{move.toFixed(1)}%</em>
        </div>
      </div>

      <div className="stock-detail-body">
        <div className="stock-detail-tabs-wrap">
          <nav className="stock-detail-tabs" role="tablist" aria-label="Stock intel tabs">
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
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'news'}
              className={tab === 'news' ? 'active' : ''}
              onClick={() => setTab('news')}
            >
              News
            </button>
          </nav>

          <div className="stock-tab-content" role="tabpanel">
            {tab === 'fundamentals' ? (
              <div className="fund-pane">
                <Stat label="P/E Ratio" value={fundamentals.peRatio === 0 ? 'N/A' : fundamentals.peRatio.toString()} tip="Price-to-Earnings. Lower can mean cheap, but quality and growth matter more than the number alone. N/A = no earnings yet." />
                <Stat label="EPS" value={eps === 0 ? 'N/A' : `$${eps.toFixed(2)}`} tip="Earnings Per Share = price ÷ P/E. The annualised profit attributable to each share." />
                <Stat label="Market Cap" value={fundamentals.marketCap} tip="Smaller caps move faster but carry more risk per shock." />
                <Stat label="Beta" value={`${beta}`} tone={beta > 1.3 ? 'loss' : beta < 0.7 ? 'gain' : undefined} tip="Volatility vs the broader market. >1 moves more than the index, <1 moves less. High beta = bigger swings on macro shocks." />
                <Stat label="Revenue Growth" value={`${fundamentals.revenueGrowth >= 0 ? '+' : ''}${fundamentals.revenueGrowth}%`} tone={fundamentals.revenueGrowth >= 0 ? 'gain' : 'loss'} tip="YoY revenue change. Growing companies justify a higher P/E." />
                <Stat label="Dividend Yield" value={`${fundamentals.dividendYield.toFixed(1)}%`} tip="Higher yield often signals mature, lower-growth names." />
                <Stat label="Signal Quality" value={`${quality}%`} tip="How trustworthy this ticker's tape is. Higher = headlines and price agree." />
                <Stat label="Volatility" value={`${volatility}%`} tip="Daily move range. Higher means bigger option premiums and risk." />
                <Stat label="Short Interest" value={`${snapshot.shortInterestPct}%`} tone={snapshot.shortInterestPct > 25 ? 'loss' : snapshot.shortInterestPct < 10 ? 'gain' : undefined} tip="Percent of float sold short. >20% can squeeze higher on good news, but signals broad skepticism." />
                <Stat label="52W High" value={`$${snapshot.fiftyTwoWeekHigh.toFixed(2)}`} tip="Highest close in the past 52 weeks. Acts as long-term resistance." />
                <Stat label="52W Low" value={`$${snapshot.fiftyTwoWeekLow.toFixed(2)}`} tip="Lowest close in the past 52 weeks. Acts as long-term support." />
                <Stat label="Analyst Target" value={`$${analystTargetPrice.toFixed(2)}`} tone={snapshot.analystTargetPct >= 0 ? 'gain' : 'loss'} tip={`Average price target: ${snapshot.analystTargetPct >= 0 ? '+' : ''}${snapshot.analystTargetPct}% from current. Implied by analyst consensus.`} />
              </div>
            ) : null}

            {tab === 'technicals' ? (
              <div className="tech-pane">
                <Stat label="Trend" value={technicals.trend} tone={technicals.trend === 'UP' ? 'gain' : technicals.trend === 'DOWN' ? 'loss' : undefined} tip="Direction of the week so far. UP favors calls; DOWN favors puts." />
                <Stat label="Momentum" value={`${technicals.momentumPct >= 0 ? '+' : ''}${technicals.momentumPct}%`} tone={technicals.momentumPct >= 0 ? 'gain' : 'loss'} tip="Percent change from week open to current close. Strong momentum often continues." />
                <Stat label="RSI" value={technicals.rsi.toString()} tone={technicals.rsi >= 70 ? 'loss' : technicals.rsi <= 30 ? 'gain' : undefined} tip="0–100 strength gauge. >70 overbought (consider puts), <30 oversold (consider calls)." />
                <Stat label="5-bar MA" value={`$${technicals.movingAverage.toFixed(2)}`} tip="Average close over the visible window. Price above MA confirms uptrend." />
                <Stat label="Dist. from MA" value={`${distanceFromMa >= 0 ? '+' : ''}${distanceFromMa.toFixed(1)}%`} tone={distanceFromMa >= 0 ? 'gain' : 'loss'} tip="How far price has stretched from its 5-bar moving average. Extreme stretches often mean-revert." />
                <Stat label="Support" value={`$${technicals.support.toFixed(2)}`} tip="Lowest low so far. Breaks below often see further selling." />
                <Stat label="Resistance" value={`$${technicals.resistance.toFixed(2)}`} tip="Highest high so far. Closing above triggers continuation buying." />
                <Stat label="ATR" value={`$${atr.toFixed(2)}`} tip="Average True Range — typical daily move size. A 1-ATR move is normal, 2+ ATR moves are notable." />
                <Stat label="Range Position" value={`${rangePosition.toFixed(0)}%`} tone={rangePosition >= 80 ? 'loss' : rangePosition <= 20 ? 'gain' : undefined} tip="Where the current price sits within the 52-week range. Near 100% is at highs (extended); near 0% is at lows (washed out)." />
                <Stat label="52W Range" value={`$${snapshot.fiftyTwoWeekLow.toFixed(0)}–$${snapshot.fiftyTwoWeekHigh.toFixed(0)}`} tip="The 52-week price extremes. Wider ranges mean more historical volatility." />
                <Stat label="Avg Volume" value={technicals.averageVolume.toLocaleString()} tip="Liquidity proxy. High volume on a move makes the signal more reliable." />
                <Stat label="Rel. Volume" value={`${relativeVolume.toFixed(2)}×`} tone={relativeVolume >= 1.5 ? 'gain' : relativeVolume <= 0.6 ? 'loss' : undefined} tip="Today's volume vs the average. >1.5× confirms a move; <0.7× means the move is on weak conviction." />
              </div>
            ) : null}

            {tab === 'news' ? (
              <div className="news-pane">
                <p className="news-narrative">{fundamentals.narrative}</p>
                <ul>
                  {snapshot.recentHeadlines.map((line, index) => (
                    <li key={`${ticker.definition.symbol}-headline-${index}`}>
                      <span className="news-dot" aria-hidden="true" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <small className="news-signal">{ticker.signal}</small>
              </div>
            ) : null}
          </div>
        </div>

        <div className="stock-chart-pane">
          <CandlestickChart
            prices={ticker.prices}
            priorHistory={ticker.priorHistory}
            currentDay={currentDay}
            showVolume={save.unlocks.secondMonitor}
          />
        </div>
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

function RatingPill({ rating, target }: { rating: AnalystRating; target: number }) {
  const ratingClass = rating === 'STRONG_BUY' || rating === 'BUY' ? 'gain' : rating === 'STRONG_SELL' || rating === 'SELL' ? 'loss' : '';
  const sign = target >= 0 ? '+' : '';
  return (
    <span className={`rating-pill ${ratingClass}`} title={`Analyst consensus and avg target ${sign}${target}% from current.`}>
      {rating.replaceAll('_', ' ')} <em>{sign}{target}%</em>
    </span>
  );
}
