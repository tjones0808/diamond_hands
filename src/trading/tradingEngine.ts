import type { OptionContract, RunState } from '../game/types';
import { estimatePremium, settleOptionValue } from './options';

export function buyShares(run: RunState, symbol: string, quantity: number, price: number): RunState {
  const cost = roundMoney(quantity * price);
  if (cost > run.cash) return addLog(run, `Not enough cash to buy ${quantity} ${symbol} shares.`);

  const existing = run.sharePositions.find((position) => position.symbol === symbol);
  const sharePositions = existing
    ? run.sharePositions.map((position) => {
        if (position.symbol !== symbol) return position;
        const totalQuantity = position.quantity + quantity;
        const totalCost = position.averagePrice * position.quantity + cost;
        return { ...position, quantity: totalQuantity, averagePrice: roundMoney(totalCost / totalQuantity) };
      })
    : [...run.sharePositions, { symbol, quantity, averagePrice: price }];

  return addLog({ ...run, cash: roundMoney(run.cash - cost), sharePositions }, `Bought ${quantity} ${symbol} shares.`);
}

export function buyCall(run: RunState, symbol: string, strike: number, quantity: number, premium: number): RunState {
  return buyOption(run, symbol, 'CALL', strike, quantity, premium);
}

export function buyPut(run: RunState, symbol: string, strike: number, quantity: number, premium: number): RunState {
  return buyOption(run, symbol, 'PUT', strike, quantity, premium);
}

export function sellShares(run: RunState, symbol: string, quantity: number, price: number): RunState {
  const existing = run.sharePositions.find((position) => position.symbol === symbol);
  if (!existing) return addLog(run, `No ${symbol} shares to sell.`);

  const sellQuantity = Math.min(quantity, existing.quantity);
  const proceeds = roundMoney(sellQuantity * price);
  const remainingQuantity = existing.quantity - sellQuantity;
  const sharePositions = remainingQuantity > 0
    ? run.sharePositions.map((position) => position.symbol === symbol ? { ...position, quantity: remainingQuantity } : position)
    : run.sharePositions.filter((position) => position.symbol !== symbol);
  const profit = roundMoney((price - existing.averagePrice) * sellQuantity);

  return addLog(
    { ...run, cash: roundMoney(run.cash + proceeds), sharePositions },
    `Sold ${sellQuantity} ${symbol} shares for $${proceeds} (${profit >= 0 ? '+' : ''}$${profit}).`
  );
}

export function closeOptionsForSymbol(run: RunState, symbol: string, currentPrice: number, volatility: number): RunState {
  const closing = run.optionPositions.filter((option) => option.symbol === symbol);
  if (closing.length === 0) return addLog(run, `No ${symbol} options to close.`);

  const proceeds = roundMoney(closing.reduce((total, option) => {
    return total + estimatePremium(currentPrice, option.strike, volatility, option.type) * option.quantity;
  }, 0));
  const optionPositions = run.optionPositions.filter((option) => option.symbol !== symbol);

  return addLog(
    { ...run, cash: roundMoney(run.cash + proceeds), optionPositions },
    `Closed ${symbol} options for $${proceeds}.`
  );
}

export function settleOptions(run: RunState, finalPrices: Record<string, number>): RunState {
  let cash = run.cash;
  const logs = [...run.weekLog];

  for (const option of run.optionPositions) {
    const finalPrice = finalPrices[option.symbol];
    if (finalPrice === undefined) continue;
    const payout = settleOptionValue(option.type, option.strike, finalPrice, option.quantity);
    cash = roundMoney(cash + payout);
    logs.push(`${option.symbol} ${option.type} ${option.strike} expired ${payout > 0 ? 'in the money' : 'worthless'} for $${payout}.`);
  }

  return { ...run, cash, optionPositions: [], weekLog: logs };
}

function buyOption(run: RunState, symbol: string, type: 'CALL' | 'PUT', strike: number, quantity: number, premium: number): RunState {
  const cost = roundMoney(quantity * premium);
  if (cost > run.cash) return addLog(run, `Not enough cash to buy ${quantity} ${symbol} ${type}.`);

  const contract: OptionContract = {
    id: `${run.week}-${run.day}-${symbol}-${type}-${strike}-${run.optionPositions.length}`,
    symbol,
    type,
    strike,
    premium,
    quantity,
    openedDay: run.day,
    expiresDay: 'FRI'
  };

  return addLog(
    { ...run, cash: roundMoney(run.cash - cost), optionPositions: [...run.optionPositions, contract] },
    `Bought ${quantity} ${symbol} ${type} ${strike}.`
  );
}

function addLog(run: RunState, message: string): RunState {
  return { ...run, weekLog: [...run.weekLog, message] };
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
