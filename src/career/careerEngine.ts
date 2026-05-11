import type { CareerTier } from '../game/types';

export interface CareerGate {
  tier: CareerTier;
  nextTier?: CareerTier;
  requiredNetWorth: number;
  requiredReputation: number;
  requiredXp: number;
  title: string;
  roomLabel: string;
}

export const careerGates: CareerGate[] = [
  {
    tier: 'BEDROOM_DAY_TRADER',
    nextTier: 'PROP_DESK_ROOKIE',
    requiredNetWorth: 6000,
    requiredReputation: 42,
    requiredXp: 4,
    title: 'Bedroom Day Trader',
    roomLabel: 'Bad bedroom'
  },
  {
    tier: 'PROP_DESK_ROOKIE',
    nextTier: 'STOCK_BROKER',
    requiredNetWorth: 12000,
    requiredReputation: 50,
    requiredXp: 9,
    title: 'Prop Desk Rookie',
    roomLabel: 'Shared prop desk'
  },
  {
    tier: 'STOCK_BROKER',
    nextTier: 'FUND_MANAGER',
    requiredNetWorth: 28000,
    requiredReputation: 62,
    requiredXp: 16,
    title: 'Stock Broker',
    roomLabel: 'Client office'
  },
  {
    tier: 'FUND_MANAGER',
    nextTier: 'HEDGE_FUND_FOUNDER',
    requiredNetWorth: 65000,
    requiredReputation: 75,
    requiredXp: 25,
    title: 'Fund Manager',
    roomLabel: 'Fund floor'
  },
  {
    tier: 'HEDGE_FUND_FOUNDER',
    requiredNetWorth: 150000,
    requiredReputation: 90,
    requiredXp: 40,
    title: 'Hedge Fund Founder',
    roomLabel: 'High-rise office'
  }
];

export function checkBankruptcy<T extends { cash: number; isBankrupt: boolean }>(run: T): T {
  return run.cash < 0 ? { ...run, isBankrupt: true } : run;
}

export function applyWeekOutcome(input: { cashDelta: number; reputation: number; xp: number }) {
  if (input.cashDelta > 0) {
    return { reputation: Math.min(100, input.reputation + 3), xp: input.xp + 2 };
  }

  if (input.cashDelta < -1000) {
    return { reputation: Math.max(0, input.reputation - 4), xp: input.xp + 1 };
  }

  return { reputation: input.reputation, xp: input.xp + 1 };
}

export function getCareerGate(tier: CareerTier): CareerGate {
  const gate = careerGates.find((item) => item.tier === tier);
  if (!gate) {
    throw new Error(`Unknown career tier: ${tier}`);
  }
  return gate;
}

export function evaluatePromotion(input: { tier: CareerTier; xp: number; reputation: number; netWorth: number }) {
  const gate = getCareerGate(input.tier);
  if (!gate.nextTier) {
    return { tier: input.tier, promoted: false, gate };
  }

  const qualifies = input.netWorth >= gate.requiredNetWorth
    && input.reputation >= gate.requiredReputation
    && input.xp >= gate.requiredXp;

  return {
    tier: qualifies ? gate.nextTier : input.tier,
    promoted: qualifies,
    gate
  };
}
