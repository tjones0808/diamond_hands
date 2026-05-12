import type {
  OptionContract,
  OptionExpiryDay,
  OptionResult,
  OptionSide,
  OptionStrategyType,
  RunState,
  WeekDay
} from '../game/types';
import { CONTRACT_SIZE, estimatePremium, settleOptionValue } from './options';
import { getBuyingPower } from './margin';
import { getShareCommissionPerShare } from '../career/tierUnlocks';

export interface OpenOptionLeg {
  symbol: string;
  type: 'CALL' | 'PUT';
  side: OptionSide;
  strike: number;
  premium: number;
  quantity: number;
}

export interface OpenMultiLegInput {
  strategyType: OptionStrategyType;
  expiresDay: OptionExpiryDay;
  legs: OpenOptionLeg[];
}

export function buyShares(run: RunState, symbol: string, quantity: number, price: number): RunState {
  const commission = roundMoney(getShareCommissionPerShare(run.tier) * quantity);
  const cost = roundMoney(quantity * price);
  const totalOutlay = roundMoney(cost + commission);
  const buyingPower = getBuyingPower(run);
  if (totalOutlay > buyingPower) return addLog(run, `Not enough buying power to buy ${quantity} ${symbol} shares.`);

  const existing = run.sharePositions.find((position) => position.symbol === symbol);
  const sharePositions = existing
    ? run.sharePositions.map((position) => {
        if (position.symbol !== symbol) return position;
        const totalQuantity = position.quantity + quantity;
        const totalCost = position.averagePrice * position.quantity + cost;
        return { ...position, quantity: totalQuantity, averagePrice: roundMoney(totalCost / totalQuantity) };
      })
    : [...run.sharePositions, { symbol, quantity, averagePrice: price }];

  // If cost exceeds cash, the excess is borrowed on margin. Commission is paid in cash if possible.
  const cashSpent = Math.min(run.cash, totalOutlay);
  const newMargin = Math.max(0, totalOutlay - run.cash);
  const noteSuffix = newMargin > 0 ? ` ($${newMargin.toFixed(2)} on margin)` : '';
  const commissionNote = commission > 0 ? ` Commission $${commission.toFixed(2)}.` : '';

  return addLog(
    {
      ...run,
      cash: roundMoney(run.cash - cashSpent),
      marginUsed: roundMoney(run.marginUsed + newMargin),
      sharePositions
    },
    `Bought ${quantity} ${symbol} shares.${noteSuffix}${commissionNote}`
  );
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

  const commission = roundMoney(getShareCommissionPerShare(run.tier) * sellQuantity);
  const netProceeds = roundMoney(proceeds - commission);

  // Auto-pay down margin first, then deposit remaining into cash.
  const marginPaydown = Math.min(run.marginUsed, netProceeds);
  const cashCredit = netProceeds - marginPaydown;
  const paydownNote = marginPaydown > 0 ? ` (paid down $${marginPaydown.toFixed(2)} margin)` : '';
  const commissionNote = commission > 0 ? ` Commission $${commission.toFixed(2)}.` : '';

  return addLog(
    {
      ...run,
      cash: roundMoney(run.cash + cashCredit),
      marginUsed: roundMoney(run.marginUsed - marginPaydown),
      sharePositions
    },
    `Sold ${sellQuantity} ${symbol} shares for $${proceeds} (${profit >= 0 ? '+' : ''}$${profit}).${paydownNote}${commissionNote}`
  );
}

export function buyCall(
  run: RunState,
  symbol: string,
  strike: number,
  quantity: number,
  premium: number,
  expiresDay: OptionExpiryDay = 'FRI'
): RunState {
  return openMultiLegOptions(run, {
    strategyType: 'SINGLE_CALL',
    expiresDay,
    legs: [{ symbol, type: 'CALL', side: 'LONG', strike, premium, quantity }]
  });
}

export function buyPut(
  run: RunState,
  symbol: string,
  strike: number,
  quantity: number,
  premium: number,
  expiresDay: OptionExpiryDay = 'FRI'
): RunState {
  return openMultiLegOptions(run, {
    strategyType: 'SINGLE_PUT',
    expiresDay,
    legs: [{ symbol, type: 'PUT', side: 'LONG', strike, premium, quantity }]
  });
}

export function openMultiLegOptions(run: RunState, input: OpenMultiLegInput): RunState {
  if (input.legs.length === 0) return addLog(run, 'No legs to open.');

  const netDebit = roundMoney(input.legs.reduce((total, leg) => {
    const legCost = leg.premium * leg.quantity * CONTRACT_SIZE;
    const cashFlow = leg.side === 'LONG' ? legCost : -legCost;
    return total + cashFlow;
  }, 0));

  if (netDebit > run.cash) {
    return addLog(run, `Not enough cash to open ${strategyLabel(input.strategyType)} (need $${netDebit.toFixed(2)}).`);
  }

  const strategyId = `${run.week}-${run.day}-${input.strategyType}-${run.optionPositions.length}`;
  const symbol = input.legs[0].symbol;

  const newContracts: OptionContract[] = input.legs.map((leg, index): OptionContract => ({
    id: `${strategyId}-${index}`,
    symbol: leg.symbol,
    type: leg.type,
    side: leg.side,
    strike: leg.strike,
    premium: leg.premium,
    quantity: leg.quantity,
    openedDay: run.day,
    expiresDay: input.expiresDay,
    strategyId,
    strategyType: input.strategyType
  }));

  const cashDescriptor = netDebit >= 0 ? `debit $${netDebit.toFixed(2)}` : `credit $${Math.abs(netDebit).toFixed(2)}`;

  return addLog(
    {
      ...run,
      cash: roundMoney(run.cash - netDebit),
      optionPositions: [...run.optionPositions, ...newContracts]
    },
    `Opened ${strategyLabel(input.strategyType)} on ${symbol} (${input.expiresDay} expiry, ${cashDescriptor}).`
  );
}

export function closeOptionsForSymbol(
  run: RunState,
  symbol: string,
  currentPrice: number,
  volatility: number
): RunState {
  const closing = run.optionPositions.filter((option) => option.symbol === symbol);
  if (closing.length === 0) return addLog(run, `No ${symbol} options to close.`);

  const proceeds = roundMoney(closing.reduce((total, option) => {
    const remaining = remainingDays(run.day, option.expiresDay);
    const markValue = estimatePremium(currentPrice, option.strike, volatility, option.type, remaining) * option.quantity * CONTRACT_SIZE;
    return total + (option.side === 'LONG' ? markValue : -markValue);
  }, 0));
  const optionPositions = run.optionPositions.filter((option) => option.symbol !== symbol);

  const cashDescriptor = proceeds >= 0 ? `+$${proceeds.toFixed(2)}` : `-$${Math.abs(proceeds).toFixed(2)}`;
  return addLog(
    { ...run, cash: roundMoney(run.cash + proceeds), optionPositions },
    `Closed ${symbol} options for ${cashDescriptor}.`
  );
}

export function settleExpiringOptions(
  run: RunState,
  day: OptionExpiryDay,
  finalPrices: Record<string, number>
): RunState {
  const expiring = run.optionPositions.filter((option) => option.expiresDay === day);
  if (expiring.length === 0) return run;

  let cash = run.cash;
  const logs = [...run.weekLog];
  const newResults: OptionResult[] = [];

  for (const option of expiring) {
    const finalPrice = finalPrices[option.symbol];
    if (finalPrice === undefined) continue;
    const intrinsicValue = settleOptionValue(option.type, option.strike, finalPrice, option.quantity) * CONTRACT_SIZE;
    const premiumPaid = roundMoney(option.premium * option.quantity * CONTRACT_SIZE);
    let settlementValue: number;
    let pnl: number;

    if (option.side === 'LONG') {
      settlementValue = intrinsicValue;
      cash = roundMoney(cash + settlementValue);
      pnl = roundMoney(settlementValue - premiumPaid);
    } else {
      settlementValue = -intrinsicValue;
      cash = roundMoney(cash + settlementValue);
      pnl = roundMoney(premiumPaid + settlementValue);
    }

    const sideLabel = option.side === 'SHORT' ? 'short ' : '';
    const moneyLabel = intrinsicValue > 0 ? 'in the money' : 'worthless';
    logs.push(
      `${option.symbol} ${sideLabel}${option.type} ${option.strike} (${option.expiresDay}) expired ${moneyLabel}: ${signed(pnl)}.`
    );

    newResults.push({
      symbol: option.symbol,
      type: option.type,
      side: option.side,
      strike: option.strike,
      quantity: option.quantity,
      premiumPaid,
      settlementValue: roundMoney(settlementValue),
      pnl,
      expiredInTheMoney: intrinsicValue > 0,
      expiresDay: option.expiresDay,
      strategyId: option.strategyId,
      strategyType: option.strategyType
    });
  }

  return {
    ...run,
    cash,
    optionPositions: run.optionPositions.filter((option) => option.expiresDay !== day),
    weekLog: logs,
    weekOptionResults: [...run.weekOptionResults, ...newResults]
  };
}

export function settleOptions(run: RunState, finalPrices: Record<string, number>): RunState {
  let next = run;
  for (const day of ['TUE', 'THU', 'FRI'] as const) {
    next = settleExpiringOptions(next, day, finalPrices);
  }
  return next;
}

function remainingDays(currentDay: WeekDay, expiresDay: OptionExpiryDay) {
  const dayIndex: Record<WeekDay, number> = { MON: 0, TUE: 1, WED: 2, THU: 3, FRI: 4 };
  return Math.max(1, dayIndex[expiresDay] - dayIndex[currentDay] + 1);
}

function strategyLabel(type: OptionStrategyType): string {
  switch (type) {
    case 'SINGLE_CALL': return 'CALL';
    case 'SINGLE_PUT': return 'PUT';
    case 'CALL_SPREAD': return 'CALL SPREAD';
    case 'PUT_SPREAD': return 'PUT SPREAD';
    case 'STRADDLE': return 'STRADDLE';
  }
}

function signed(value: number) {
  const rounded = Math.round(value * 100) / 100;
  return `${rounded >= 0 ? '+' : '-'}$${Math.abs(rounded).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function addLog(run: RunState, message: string): RunState {
  return { ...run, weekLog: [...run.weekLog, message] };
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
