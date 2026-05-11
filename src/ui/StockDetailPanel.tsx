import type { MarketTicker } from '../game/types';

interface StockDetailPanelProps {
  ticker?: MarketTicker;
  currentPrice: number;
}

export function StockDetailPanel({ ticker, currentPrice }: StockDetailPanelProps) {
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

  const startPrice = ticker.prices[0]?.price ?? currentPrice;
  const move = startPrice > 0 ? ((currentPrice - startPrice) / startPrice) * 100 : 0;
  const quality = Math.round(ticker.definition.quality * 100);
  const volatility = Math.round(ticker.definition.volatility * 100);
  const thesis = getThesis(move, ticker.definition.quality, ticker.definition.volatility);
  const points = getSparklinePoints(ticker.prices.map((point) => point.price));

  return (
    <article className="signal-card stock-detail-panel">
      <div className="stock-intel-copy">
        <div className="section-heading">
          <h2>Stock Intel</h2>
          <span>{ticker.definition.sector}</span>
        </div>
        <strong>{ticker.definition.name}</strong>
        <p>{ticker.signal}</p>
      </div>

      <div className="intel-metrics" aria-label={`${ticker.definition.symbol} metrics`}>
        <span>
          <small>Price</small>
          <b>${currentPrice.toFixed(2)}</b>
        </span>
        <span>
          <small>Move</small>
          <b className={move >= 0 ? 'gain' : 'loss'}>{move >= 0 ? '+' : ''}{move.toFixed(1)}%</b>
        </span>
        <span>
          <small>Signal Quality</small>
          <b>{quality}%</b>
        </span>
        <span>
          <small>Volatility</small>
          <b>{volatility}%</b>
        </span>
      </div>

      <div className="intel-spark" aria-hidden="true">
        <svg viewBox="0 0 120 38" role="img">
          <polyline points={points} />
        </svg>
        <em>{thesis}</em>
      </div>
    </article>
  );
}

function getThesis(move: number, quality: number, volatility: number) {
  if (volatility >= 0.13) return 'Options tape is jumpy';
  if (quality >= 0.68 && move >= 0) return 'Clean momentum setup';
  if (move <= -6) return 'Knife catch risk';
  if (move >= 6) return 'Breakout pressure';
  return 'Mixed tape, size carefully';
}

function getSparklinePoints(values: number[]) {
  if (values.length === 0) return '';

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const step = values.length > 1 ? 118 / (values.length - 1) : 0;

  return values.map((value, index) => {
    const x = 1 + index * step;
    const y = 35 - ((value - min) / range) * 32;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}
