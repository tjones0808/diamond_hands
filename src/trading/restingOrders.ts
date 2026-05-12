import type { PricePoint, RestingOrder, RestingOrderType, RunState, WeekDay } from '../game/types';

/**
 * Sweeps all resting orders against the day's high/low. Triggered orders execute at the
 * trigger price (no slippage in v1). Untriggered orders carry forward.
 */
export function sweepRestingOrders(run: RunState, day: WeekDay): RunState {
  if (run.restingOrders.length === 0) return run;

  const remaining: RestingOrder[] = [];
  let cash = run.cash;
  let sharePositions = run.sharePositions;
  const logs = [...run.weekLog];

  for (const order of run.restingOrders) {
    const ticker = run.tickers.find((t) => t.definition.symbol === order.symbol);
    const dayBar = ticker?.prices.find((p) => p.day === day);
    if (!dayBar) {
      remaining.push(order);
      continue;
    }

    if (!isTriggered(order, dayBar)) {
      remaining.push(order);
      continue;
    }

    const fillPrice = order.triggerPrice;
    const executed = applyExecutedOrder(order, sharePositions, cash, fillPrice);
    if (!executed) {
      // Couldn't execute (no shares to sell, not enough cash, etc.). Cancel silently.
      logs.push(`Resting ${humanLabel(order.type)} on ${order.symbol} could not execute (insufficient position or cash).`);
      continue;
    }

    sharePositions = executed.sharePositions;
    cash = executed.cash;
    logs.push(
      `${humanLabel(order.type)} triggered: ${order.quantity} ${order.symbol} @ $${fillPrice.toFixed(2)}.`
    );
  }

  return { ...run, restingOrders: remaining, cash, sharePositions, weekLog: logs };
}

export function isTriggered(order: RestingOrder, bar: PricePoint): boolean {
  switch (order.type) {
    case 'STOP_LOSS':
      // Triggered when price falls to or below the stop.
      return bar.low <= order.triggerPrice;
    case 'LIMIT_BUY':
      // Triggered when price reaches or goes below the limit.
      return bar.low <= order.triggerPrice;
    case 'LIMIT_SELL':
      // Triggered when price reaches or rises above the limit.
      return bar.high >= order.triggerPrice;
  }
}

function applyExecutedOrder(
  order: RestingOrder,
  sharePositions: RunState['sharePositions'],
  cash: number,
  fillPrice: number
): { sharePositions: RunState['sharePositions']; cash: number } | null {
  if (order.type === 'LIMIT_BUY') {
    const cost = roundMoney(order.quantity * fillPrice);
    if (cost > cash) return null;
    const existing = sharePositions.find((p) => p.symbol === order.symbol);
    const nextPositions = existing
      ? sharePositions.map((p) => {
          if (p.symbol !== order.symbol) return p;
          const totalQty = p.quantity + order.quantity;
          const totalCost = p.averagePrice * p.quantity + cost;
          return { ...p, quantity: totalQty, averagePrice: roundMoney(totalCost / totalQty) };
        })
      : [...sharePositions, { symbol: order.symbol, quantity: order.quantity, averagePrice: fillPrice }];
    return { sharePositions: nextPositions, cash: roundMoney(cash - cost) };
  }

  // STOP_LOSS or LIMIT_SELL — both close out part of the position at fillPrice.
  const existing = sharePositions.find((p) => p.symbol === order.symbol);
  if (!existing) return null;
  const sellQuantity = Math.min(order.quantity, existing.quantity);
  if (sellQuantity <= 0) return null;
  const proceeds = roundMoney(sellQuantity * fillPrice);
  const remainingQty = existing.quantity - sellQuantity;
  const nextPositions = remainingQty > 0
    ? sharePositions.map((p) => (p.symbol === order.symbol ? { ...p, quantity: remainingQty } : p))
    : sharePositions.filter((p) => p.symbol !== order.symbol);
  return { sharePositions: nextPositions, cash: roundMoney(cash + proceeds) };
}

export function createRestingOrder(
  run: RunState,
  type: RestingOrderType,
  symbol: string,
  quantity: number,
  triggerPrice: number
): RunState {
  const id = `${run.week}-${run.day}-${type}-${symbol}-${run.restingOrders.length}-${Math.floor(Math.random() * 1e6)}`;
  const order: RestingOrder = {
    id,
    type,
    symbol,
    triggerPrice: roundMoney(triggerPrice),
    quantity,
    createdDay: run.day,
    createdWeek: run.week
  };
  return {
    ...run,
    restingOrders: [...run.restingOrders, order],
    weekLog: [...run.weekLog, `Set ${humanLabel(type)} on ${quantity} ${symbol} @ $${order.triggerPrice.toFixed(2)}.`]
  };
}

export function cancelRestingOrder(run: RunState, orderId: string): RunState {
  const order = run.restingOrders.find((o) => o.id === orderId);
  if (!order) return run;
  return {
    ...run,
    restingOrders: run.restingOrders.filter((o) => o.id !== orderId),
    weekLog: [...run.weekLog, `Cancelled ${humanLabel(order.type)} on ${order.symbol}.`]
  };
}

function humanLabel(type: RestingOrderType): string {
  switch (type) {
    case 'STOP_LOSS': return 'Stop Loss';
    case 'LIMIT_BUY': return 'Limit Buy';
    case 'LIMIT_SELL': return 'Limit Sell';
  }
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
