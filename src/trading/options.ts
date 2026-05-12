import type { OptionExpiryDay, WeekDay } from '../game/types';

const dayIndex: Record<WeekDay, number> = { MON: 0, TUE: 1, WED: 2, THU: 3, FRI: 4 };

export function daysToExpiry(currentDay: WeekDay, expiresDay: OptionExpiryDay): number {
  return Math.max(1, dayIndex[expiresDay] - dayIndex[currentDay] + 1);
}

export function estimatePremium(
  currentPrice: number,
  strike: number,
  volatility: number,
  type: 'CALL' | 'PUT',
  remainingDays: number = 5
) {
  const intrinsic = type === 'CALL'
    ? Math.max(0, currentPrice - strike)
    : Math.max(0, strike - currentPrice);
  const distance = Math.abs(currentPrice - strike) / Math.max(1, currentPrice);
  const timeFactor = Math.sqrt(Math.max(1, remainingDays) / 5);
  const timeValue = currentPrice * Math.max(0.02, volatility) * Math.max(0.35, 1 - distance) * timeFactor;
  return roundMoney(Math.max(0.5, intrinsic + timeValue));
}

export function settleOptionValue(type: 'CALL' | 'PUT', strike: number, finalPrice: number, quantity: number) {
  const value = type === 'CALL'
    ? Math.max(0, finalPrice - strike)
    : Math.max(0, strike - finalPrice);
  return roundMoney(value * quantity);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
