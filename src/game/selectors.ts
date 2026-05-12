import type { RunState } from './types';

export function getNetWorth(run: RunState) {
  const shareValue = run.sharePositions.reduce((total, position) => {
    const ticker = run.tickers.find((item) => item.definition.symbol === position.symbol);
    const price = ticker?.prices.find((point) => point.day === run.day)?.price ?? position.averagePrice;
    return total + position.quantity * price;
  }, 0);

  return Math.round((run.cash + shareValue - run.marginUsed) * 100) / 100;
}

export function getCurrentPrice(run: RunState, symbol: string) {
  const ticker = run.tickers.find((item) => item.definition.symbol === symbol);
  return ticker?.prices.find((point) => point.day === run.day)?.price ?? ticker?.definition.basePrice ?? 0;
}
