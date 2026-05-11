import type { RunState } from '../game/types';
import { getCurrentPrice } from '../game/selectors';

export function MarketTape({ run }: { run: RunState }) {
  const quotes = run.tickers.map((ticker) => {
    const price = getCurrentPrice(run, ticker.definition.symbol);
    const open = ticker.prices[0]?.price ?? price;
    const move = open === 0 ? 0 : ((price - open) / open) * 100;

    return {
      move,
      price,
      symbol: ticker.definition.symbol
    };
  });

  return (
    <section className="market-tape" aria-label="Market tape">
      <div className="tape-brand">
        <span>Rogue Street</span>
        <strong>Cash Velocity Desk</strong>
      </div>
      <div className="tape-stream">
        {quotes.map((quote) => (
          <span className="tape-quote" key={quote.symbol}>
            <strong>{quote.symbol}</strong>
            <span>${quote.price.toFixed(2)}</span>
            <em className={quote.move >= 0 ? 'gain' : 'loss'}>{quote.move >= 0 ? '+' : ''}{quote.move.toFixed(1)}%</em>
          </span>
        ))}
      </div>
      <div className="tape-clock">
        <span>{run.marketRegime.replaceAll('_', ' ')}</span>
        <strong>W{run.week} / {run.day}</strong>
      </div>
    </section>
  );
}
