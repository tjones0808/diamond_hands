import { describe, expect, it } from 'vitest';
import {
  canUseLimitOrders,
  canUseStopLosses,
  getDailyMarginRate,
  getShareCommissionPerShare,
  getTierUnlocks
} from './tierUnlocks';

describe('tierUnlocks', () => {
  it('locks limit orders below Stock Broker', () => {
    expect(canUseLimitOrders('BEDROOM_DAY_TRADER')).toBe(false);
    expect(canUseLimitOrders('PROP_DESK_ROOKIE')).toBe(false);
    expect(canUseLimitOrders('STOCK_BROKER')).toBe(true);
    expect(canUseLimitOrders('FUND_MANAGER')).toBe(true);
    expect(canUseLimitOrders('HEDGE_FUND_FOUNDER')).toBe(true);
  });

  it('locks stop losses below Fund Manager', () => {
    expect(canUseStopLosses('BEDROOM_DAY_TRADER')).toBe(false);
    expect(canUseStopLosses('STOCK_BROKER')).toBe(false);
    expect(canUseStopLosses('FUND_MANAGER')).toBe(true);
    expect(canUseStopLosses('HEDGE_FUND_FOUNDER')).toBe(true);
  });

  it('charges share commission starting at Stock Broker', () => {
    expect(getShareCommissionPerShare('BEDROOM_DAY_TRADER')).toBe(0);
    expect(getShareCommissionPerShare('PROP_DESK_ROOKIE')).toBe(0);
    expect(getShareCommissionPerShare('STOCK_BROKER')).toBeGreaterThan(0);
    expect(getShareCommissionPerShare('HEDGE_FUND_FOUNDER')).toBeGreaterThan(0);
  });

  it('reduces daily margin rate at Fund Manager and Hedge Fund Founder', () => {
    expect(getDailyMarginRate('BEDROOM_DAY_TRADER')).toBe(0.001);
    expect(getDailyMarginRate('STOCK_BROKER')).toBe(0.001);
    expect(getDailyMarginRate('FUND_MANAGER')).toBe(0.0005);
    expect(getDailyMarginRate('HEDGE_FUND_FOUNDER')).toBe(0.0002);
  });

  it('summarises all unlocks via getTierUnlocks', () => {
    const summary = getTierUnlocks('FUND_MANAGER');
    expect(summary).toMatchObject({
      limitOrders: true,
      stopLosses: true,
      shareCommission: 0.005,
      marginRate: 0.0005
    });
  });
});
