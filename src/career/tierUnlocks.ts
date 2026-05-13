import type { CareerTier } from '../game/types';

const tierOrder: CareerTier[] = [
  'BEDROOM_DAY_TRADER',
  'PROP_DESK_ROOKIE',
  'STOCK_BROKER',
  'FUND_MANAGER',
  'HEDGE_FUND_FOUNDER'
];

function tierAtLeast(tier: CareerTier, minimum: CareerTier): boolean {
  return tierOrder.indexOf(tier) >= tierOrder.indexOf(minimum);
}

/** Limit Buy / Limit Sell orders unlock at Stock Broker. */
export function canUseLimitOrders(tier: CareerTier): boolean {
  return tierAtLeast(tier, 'STOCK_BROKER');
}

/** Stop Loss orders unlock at Fund Manager. */
export function canUseStopLosses(tier: CareerTier): boolean {
  return tierAtLeast(tier, 'FUND_MANAGER');
}

/** Covered calls unlock at Stock Broker (need clients + understanding of collateralised options). */
export function canUseCoveredCalls(tier: CareerTier): boolean {
  return tierAtLeast(tier, 'STOCK_BROKER');
}

/** Per-share commission. Stock brokers and above pay a small commission per share trade. */
export function getShareCommissionPerShare(tier: CareerTier): number {
  if (tierAtLeast(tier, 'STOCK_BROKER')) return 0.005;
  return 0;
}

/**
 * Daily margin interest rate. Lower tiers pay the standard 0.1% per day. Senior tiers
 * have established credit and pay less.
 */
export function getDailyMarginRate(tier: CareerTier): number {
  if (tierAtLeast(tier, 'HEDGE_FUND_FOUNDER')) return 0.0002; // 0.02%
  if (tierAtLeast(tier, 'FUND_MANAGER')) return 0.0005; // 0.05%
  return 0.001; // 0.1%
}

export interface TierUnlockSummary {
  limitOrders: boolean;
  stopLosses: boolean;
  shareCommission: number;
  marginRate: number;
}

export function getTierUnlocks(tier: CareerTier): TierUnlockSummary {
  return {
    limitOrders: canUseLimitOrders(tier),
    stopLosses: canUseStopLosses(tier),
    shareCommission: getShareCommissionPerShare(tier),
    marginRate: getDailyMarginRate(tier)
  };
}
