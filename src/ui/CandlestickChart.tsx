import type { PricePoint, WeekDay } from '../game/types';

interface CandlestickChartProps {
  prices: PricePoint[];
  priorHistory?: PricePoint[];
  currentDay: WeekDay;
  height?: number;
  width?: number;
  showMovingAverage?: boolean;
  showVolume?: boolean;
}

const dayOrder: WeekDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

export function CandlestickChart({
  prices,
  priorHistory = [],
  currentDay,
  height = 200,
  width = 480,
  showMovingAverage = true,
  showVolume = false
}: CandlestickChartProps) {
  if (prices.length === 0) {
    return (
      <div className="candle-chart-empty" aria-label="No price data">
        <small>No price data yet</small>
      </div>
    );
  }

  const historyCount = priorHistory.length;
  // Only render bars up to and including the current day — no future "shadow" bars.
  const visibleCurrentBars = prices.slice(0, dayOrder.indexOf(currentDay) + 1);
  const bars = [...priorHistory, ...visibleCurrentBars];
  const padding = 28;
  const innerWidth = width - padding * 2;
  const volumePanelHeight = showVolume ? 28 : 0;
  const innerHeight = height - padding - 14 - volumePanelHeight; // candles area
  // Slot sizing assumes a full week is visible so candles don't grow as days pass.
  const slot = innerWidth / (historyCount + dayOrder.length);
  const candleWidth = Math.max(3, Math.min(14, slot - 4));

  const visibleBars = bars;
  const high = Math.max(...visibleBars.map((b) => b.high));
  const low = Math.min(...visibleBars.map((b) => b.low));
  const range = Math.max(0.5, high - low);
  const maxVolume = Math.max(1, ...visibleBars.map((b) => b.volume));

  function priceToY(price: number) {
    const ratio = (price - low) / range;
    return padding / 2 + (innerHeight - ratio * innerHeight);
  }

  // Moving average over the last 5 bars worth of closes (1 week).
  const maPoints: Array<{ x: number; y: number }> = [];
  if (showMovingAverage) {
    for (let index = 4; index < bars.length; index += 1) {
      const window = bars.slice(index - 4, index + 1);
      const avg = window.reduce((sum, b) => sum + b.close, 0) / window.length;
      const x = padding + slot * index + slot / 2;
      maPoints.push({ x, y: priceToY(avg) });
    }
  }

  const supportLevel = Math.min(...visibleBars.map((b) => b.low));
  const resistanceLevel = Math.max(...visibleBars.map((b) => b.high));

  return (
    <svg
      className="candle-chart"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Candlestick chart with prior history, moving average, and support/resistance"
    >
      <defs>
        <linearGradient id="candle-grid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(56,189,248,0.18)" />
          <stop offset="100%" stopColor="rgba(56,189,248,0.02)" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width={width} height={height} fill="url(#candle-grid)" rx="6" />

      {/* Horizontal gridlines */}
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

      {/* Support and resistance lines */}
      <line
        x1={padding}
        x2={width - padding}
        y1={priceToY(supportLevel)}
        y2={priceToY(supportLevel)}
        stroke="rgba(110, 231, 183, 0.45)"
        strokeWidth="1"
        strokeDasharray="4 3"
      />
      <text x={width - padding - 2} y={priceToY(supportLevel) - 3} textAnchor="end" fontSize="9" fill="#6ee7b7" fontFamily="Consolas, monospace">
        SUP ${supportLevel.toFixed(2)}
      </text>
      <line
        x1={padding}
        x2={width - padding}
        y1={priceToY(resistanceLevel)}
        y2={priceToY(resistanceLevel)}
        stroke="rgba(251, 113, 133, 0.45)"
        strokeWidth="1"
        strokeDasharray="4 3"
      />
      <text x={width - padding - 2} y={priceToY(resistanceLevel) + 10} textAnchor="end" fontSize="9" fill="#fb7185" fontFamily="Consolas, monospace">
        RES ${resistanceLevel.toFixed(2)}
      </text>

      {/* Border between history and current week */}
      <line
        x1={padding + slot * historyCount}
        x2={padding + slot * historyCount}
        y1={padding / 2}
        y2={padding / 2 + innerHeight}
        stroke="rgba(56, 189, 248, 0.32)"
        strokeWidth="1"
        strokeDasharray="2 4"
      />
      <text
        x={padding + slot * historyCount + 2}
        y={padding / 2 + 10}
        fontSize="9"
        fill="#38bdf8"
        fontFamily="Consolas, monospace"
      >
        THIS WK
      </text>

      {/* Stable day-axis labels for the full current week. */}
      {dayOrder.map((day, dayIdx) => {
        const x = padding + slot * (historyCount + dayIdx) + slot / 2;
        const isToday = day === currentDay;
        return (
          <text
            key={`axis-${day}`}
            x={x}
            y={height - 4}
            textAnchor="middle"
            fontSize="9"
            fontFamily="Consolas, monospace"
            fill={isToday ? '#38bdf8' : '#475569'}
            fontWeight={isToday ? 700 : 400}
          >
            {day}
          </text>
        );
      })}

      {/* Candles */}
      {bars.map((point, index) => {
        const isHistory = index < historyCount;
        const isToday = !isHistory && index === bars.length - 1;
        const x = padding + slot * index + slot / 2;
        const yHigh = priceToY(point.high);
        const yLow = priceToY(point.low);
        const yOpen = priceToY(point.open);
        const yClose = priceToY(point.close);
        const bodyTop = Math.min(yOpen, yClose);
        const bodyHeight = Math.max(1.5, Math.abs(yClose - yOpen));
        const isUp = point.close >= point.open;
        const color = isUp ? '#34d399' : '#fb7185';
        const opacity = isHistory ? 0.62 : 1;

        return (
          <g key={`${isHistory ? 'h' : 'c'}-${index}`} opacity={opacity}>
            <line
              x1={x}
              x2={x}
              y1={yHigh}
              y2={yLow}
              stroke={color}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <rect
              x={x - candleWidth / 2}
              y={bodyTop}
              width={candleWidth}
              height={bodyHeight}
              fill={color}
              fillOpacity={isHistory ? 0.6 : (isUp ? 0.85 : 0.92)}
              stroke={color}
              strokeWidth={isToday ? 1.4 : 0.6}
              rx="1.2"
            />
          </g>
        );
      })}

      {/* Moving average overlay */}
      {showMovingAverage && maPoints.length > 1 ? (
        <polyline
          points={maPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
          fill="none"
          stroke="#facc15"
          strokeOpacity="0.78"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}

      {/* MA legend in top-left */}
      <g>
        <line x1={padding} x2={padding + 12} y1={padding / 2 + 1} y2={padding / 2 + 1} stroke="#facc15" strokeWidth="1.4" />
        <text x={padding + 16} y={padding / 2 + 4} fontSize="9" fill="#facc15" fontFamily="Consolas, monospace">5-bar MA</text>
      </g>

      {/* Volume panel (Second Monitor unlock) */}
      {showVolume ? (
        <g>
          <line
            x1={padding}
            x2={width - padding}
            y1={padding / 2 + innerHeight + 4}
            y2={padding / 2 + innerHeight + 4}
            stroke="rgba(148, 163, 184, 0.16)"
          />
          <text x={padding} y={padding / 2 + innerHeight + 14} fontSize="9" fill="#38bdf8" fontFamily="Consolas, monospace">
            VOL
          </text>
          {bars.map((point, index) => {
            const isHistory = index < historyCount;
            const x = padding + slot * index + slot / 2;
            const barHeight = (point.volume / maxVolume) * (volumePanelHeight - 8);
            const yBottom = padding / 2 + innerHeight + volumePanelHeight;
            const yTop = yBottom - barHeight;
            const isUp = point.close >= point.open;
            const color = isUp ? '#34d399' : '#fb7185';
            return (
              <rect
                key={`vol-${index}`}
                x={x - candleWidth / 2}
                y={yTop}
                width={candleWidth}
                height={barHeight}
                fill={color}
                fillOpacity={isHistory ? 0.32 : 0.55}
              />
            );
          })}
        </g>
      ) : null}
    </svg>
  );
}
