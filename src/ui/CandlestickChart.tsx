import type { PricePoint, WeekDay } from '../game/types';

interface CandlestickChartProps {
  prices: PricePoint[];
  currentDay: WeekDay;
  height?: number;
}

const dayOrder: WeekDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

export function CandlestickChart({ prices, currentDay, height = 62 }: CandlestickChartProps) {
  if (prices.length === 0) {
    return (
      <div className="candle-chart-empty" aria-label="No price data">
        <small>No price data yet</small>
      </div>
    );
  }

  const width = 280;
  const padding = 22;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding;
  const candleWidth = Math.max(8, innerWidth / prices.length - 8);
  const slot = innerWidth / prices.length;

  const allHighs = prices.map((point) => point.high);
  const allLows = prices.map((point) => point.low);
  const high = Math.max(...allHighs);
  const low = Math.min(...allLows);
  const range = Math.max(0.5, high - low);

  const currentIndex = dayOrder.indexOf(currentDay);

  function priceToY(price: number) {
    const ratio = (price - low) / range;
    return padding / 2 + (innerHeight - ratio * innerHeight);
  }

  return (
    <svg
      className="candle-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Candlestick chart for the trading week"
    >
      <defs>
        <linearGradient id="candle-grid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(56,189,248,0.18)" />
          <stop offset="100%" stopColor="rgba(56,189,248,0.02)" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width={width} height={height} fill="url(#candle-grid)" rx="6" />

      {/* horizontal gridlines */}
      {[0.25, 0.5, 0.75].map((ratio) => (
        <line
          key={ratio}
          x1={padding}
          x2={width - padding}
          y1={padding / 2 + innerHeight * ratio}
          y2={padding / 2 + innerHeight * ratio}
          stroke="rgba(148, 163, 184, 0.12)"
          strokeDasharray="2 3"
        />
      ))}

      {prices.map((point, index) => {
        const pointIndex = dayOrder.indexOf(point.day);
        const isFuture = pointIndex > currentIndex;
        const isToday = pointIndex === currentIndex;
        const x = padding + slot * index + slot / 2;
        const yHigh = priceToY(point.high);
        const yLow = priceToY(point.low);
        const yOpen = priceToY(point.open);
        const yClose = priceToY(point.close);
        const bodyTop = Math.min(yOpen, yClose);
        const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));
        const isUp = point.close >= point.open;
        const color = isFuture ? '#475569' : isUp ? '#34d399' : '#fb7185';

        return (
          <g key={point.day} opacity={isFuture ? 0.32 : 1}>
            <line
              x1={x}
              x2={x}
              y1={yHigh}
              y2={yLow}
              stroke={color}
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <rect
              x={x - candleWidth / 2}
              y={bodyTop}
              width={candleWidth}
              height={bodyHeight}
              fill={color}
              fillOpacity={isUp ? 0.85 : 0.92}
              stroke={color}
              strokeWidth="0.7"
              rx="1.5"
            />
            <text
              x={x}
              y={height - 4}
              textAnchor="middle"
              fontSize="9"
              fontFamily="Consolas, monospace"
              fill={isToday ? '#38bdf8' : '#8abeb5'}
              fontWeight={isToday ? 700 : 400}
            >
              {point.day}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
