import { describe, expect, it } from 'vitest';
import type { Client } from '../game/types';
import { createRng } from '../simulation/rng';
import { generateClientsForTier, settleClientsForWeek } from './clientPortfolio';

function makeBalancedClient(overrides: Partial<Client> = {}): Client {
  return {
    id: 'test',
    name: 'Test Client',
    backstory: '',
    riskTolerance: 'BALANCED',
    balance: 10000,
    startingBalance: 10000,
    patience: 80,
    weeksWithYou: 0,
    lifetimeFeesPaid: 0,
    ...overrides
  };
}

describe('generateClientsForTier', () => {
  it('returns no clients below Stock Broker', () => {
    expect(generateClientsForTier('BEDROOM_DAY_TRADER', createRng(1))).toHaveLength(0);
    expect(generateClientsForTier('PROP_DESK_ROOKIE', createRng(1))).toHaveLength(0);
  });

  it('generates 2 clients on promotion to Stock Broker', () => {
    const roster = generateClientsForTier('STOCK_BROKER', createRng(42));
    expect(roster).toHaveLength(2);
    expect(roster[0].balance).toBeGreaterThan(0);
    expect(roster[0].patience).toBe(80);
  });

  it('scales up at Fund Manager and Hedge Fund Founder', () => {
    expect(generateClientsForTier('FUND_MANAGER', createRng(7))).toHaveLength(4);
    expect(generateClientsForTier('HEDGE_FUND_FOUNDER', createRng(7))).toHaveLength(5);
  });

  it('keeps existing clients and only tops up to the new target', () => {
    const existing = [makeBalancedClient({ id: 'maria-chen' })];
    const roster = generateClientsForTier('STOCK_BROKER', createRng(99), existing);
    expect(roster).toHaveLength(2);
    expect(roster.some((c) => c.id === 'maria-chen')).toBe(true);
  });
});

describe('settleClientsForWeek', () => {
  it('grows balances proportionally to performance × tolerance beta', () => {
    const before = [makeBalancedClient()];
    const result = settleClientsForWeek(before, 0.1); // +10% week
    expect(result.clients).toHaveLength(1);
    // BALANCED beta = 0.8 → balance moves 8%
    expect(result.clients[0].balance).toBeCloseTo(10000 * 1.08, 1);
    expect(result.totalFeeIncome).toBeGreaterThan(0);
  });

  it('redeems conservative clients on small drawdowns', () => {
    const client = makeBalancedClient({ id: 'cons', riskTolerance: 'CONSERVATIVE', balance: 10000, startingBalance: 10000 });
    const result = settleClientsForWeek([client], -0.2); // -20% week
    expect(result.clients).toHaveLength(0);
    expect(result.departed).toHaveLength(1);
    expect(result.changes[0].redeemed).toBe(true);
    expect(result.changes[0].redeemReason).toBe('DRAWDOWN');
  });

  it('aggressive clients absorb bigger losses without leaving', () => {
    const client = makeBalancedClient({ riskTolerance: 'AGGRESSIVE', balance: 10000, startingBalance: 10000, patience: 80 });
    // -10% week with aggressive 1.2 beta → balance drops 12%, but drawdown threshold is 20%.
    const result = settleClientsForWeek([client], -0.1);
    expect(result.clients).toHaveLength(1);
    expect(result.clients[0].patience).toBeLessThan(80);
  });

  it('pays each client weekly fees that grow the lifetimeFeesPaid counter', () => {
    const client = makeBalancedClient({ lifetimeFeesPaid: 0 });
    const result = settleClientsForWeek([client], 0.05);
    expect(result.clients[0].lifetimeFeesPaid).toBeCloseTo(result.changes[0].feePaid, 2);
    expect(result.totalFeeIncome).toBeCloseTo(result.changes[0].feePaid, 2);
  });

  it('redeems when patience hits zero from consecutive bad weeks', () => {
    const client = makeBalancedClient({ riskTolerance: 'CONSERVATIVE', patience: 10, balance: 9900, startingBalance: 10000 });
    // Tiny negative week — barely a drawdown, but conservative.patienceDecay = 18 zeros it out.
    const result = settleClientsForWeek([client], -0.001);
    expect(result.clients).toHaveLength(0);
    expect(result.changes[0].redeemReason).toBe('PATIENCE');
  });
});
