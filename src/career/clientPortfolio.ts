import type { CareerTier, Client, ClientTemplate, RiskTolerance, RunState } from '../game/types';
import { clientPool } from '../content/clientPool';
import type { Rng } from '../simulation/rng';

interface ToleranceProfile {
  /** Multiplier on weekly net-worth performance applied to the client's balance. */
  performanceBeta: number;
  /** Drawdown from starting balance at which the client redeems. */
  redemptionDrawdown: number;
  /** Weekly fee as a fraction of current balance. */
  weeklyFeeRate: number;
  /** Patience drop multiplier when the week ends in the red. */
  patienceDecay: number;
  /** Patience gain when the week ends in the green. */
  patienceGain: number;
}

const toleranceProfiles: Record<RiskTolerance, ToleranceProfile> = {
  CONSERVATIVE: { performanceBeta: 0.4, redemptionDrawdown: 0.05, weeklyFeeRate: 0.0015, patienceDecay: 18, patienceGain: 6 },
  BALANCED:     { performanceBeta: 0.8, redemptionDrawdown: 0.1, weeklyFeeRate: 0.002, patienceDecay: 10, patienceGain: 5 },
  AGGRESSIVE:   { performanceBeta: 1.2, redemptionDrawdown: 0.2, weeklyFeeRate: 0.0025, patienceDecay: 6, patienceGain: 4 }
};

const startingBalanceByTier: Record<CareerTier, [number, number]> = {
  BEDROOM_DAY_TRADER: [0, 0],
  PROP_DESK_ROOKIE: [0, 0],
  STOCK_BROKER:        [6000, 12000],
  FUND_MANAGER:        [25000, 60000],
  HEDGE_FUND_FOUNDER:  [80000, 200000]
};

const clientCountByTier: Record<CareerTier, number> = {
  BEDROOM_DAY_TRADER: 0,
  PROP_DESK_ROOKIE: 0,
  STOCK_BROKER: 2,
  FUND_MANAGER: 4,
  HEDGE_FUND_FOUNDER: 5
};

export interface ClientWeeklyChange {
  clientId: string;
  feePaid: number;
  balanceDelta: number;
  redeemed: boolean;
  redeemReason?: 'DRAWDOWN' | 'PATIENCE';
}

/** Picks the right number of clients for a tier from the pool, deterministic per RNG. */
export function generateClientsForTier(tier: CareerTier, rng: Rng, existing: Client[] = []): Client[] {
  const targetCount = clientCountByTier[tier];
  if (targetCount === 0) return existing;
  if (existing.length >= targetCount) return existing;

  const [minBal, maxBal] = startingBalanceByTier[tier];
  const taken = new Set(existing.map((c) => c.id));
  const available = clientPool.filter((c) => !taken.has(c.id));
  const shuffled = [...available].sort(() => rng.next() - 0.5);
  const needed = targetCount - existing.length;
  const picked = shuffled.slice(0, needed);

  const newClients: Client[] = picked.map((template) => {
    const balance = Math.round(minBal + rng.next() * (maxBal - minBal));
    return makeClient(template, balance);
  });

  return [...existing, ...newClients];
}

function makeClient(template: ClientTemplate, balance: number): Client {
  return {
    ...template,
    balance,
    startingBalance: balance,
    patience: 80,
    weeksWithYou: 0,
    lifetimeFeesPaid: 0
  };
}

/**
 * Settles a full week of client management. Returns updated client roster, total fee
 * income paid to the player (as cash), and a list of departing client summaries.
 */
export function settleClientsForWeek(
  clients: Client[],
  weeklyPerformancePct: number
): {
  clients: Client[];
  totalFeeIncome: number;
  changes: ClientWeeklyChange[];
  departed: Client[];
} {
  if (clients.length === 0) return { clients, totalFeeIncome: 0, changes: [], departed: [] };

  const updated: Client[] = [];
  const departed: Client[] = [];
  const changes: ClientWeeklyChange[] = [];
  let totalFeeIncome = 0;

  for (const client of clients) {
    const profile = toleranceProfiles[client.riskTolerance];
    const balanceDelta = roundMoney(client.balance * weeklyPerformancePct * profile.performanceBeta);
    const newBalance = Math.max(0, roundMoney(client.balance + balanceDelta));

    const fee = roundMoney(newBalance * profile.weeklyFeeRate);
    totalFeeIncome += fee;

    let newPatience = client.patience;
    if (weeklyPerformancePct < 0) {
      newPatience = Math.max(0, newPatience - profile.patienceDecay);
    } else if (weeklyPerformancePct > 0) {
      newPatience = Math.min(100, newPatience + profile.patienceGain);
    }

    const drawdownPct = (client.startingBalance - newBalance) / Math.max(1, client.startingBalance);
    const redeemDrawdown = drawdownPct >= profile.redemptionDrawdown;
    const redeemPatience = newPatience <= 0;

    if (redeemDrawdown || redeemPatience) {
      departed.push({ ...client, balance: newBalance, patience: newPatience });
      changes.push({
        clientId: client.id,
        feePaid: fee,
        balanceDelta,
        redeemed: true,
        redeemReason: redeemDrawdown ? 'DRAWDOWN' : 'PATIENCE'
      });
      continue;
    }

    updated.push({
      ...client,
      balance: newBalance,
      patience: newPatience,
      weeksWithYou: client.weeksWithYou + 1,
      lifetimeFeesPaid: roundMoney(client.lifetimeFeesPaid + fee)
    });
    changes.push({ clientId: client.id, feePaid: fee, balanceDelta, redeemed: false });
  }

  return { clients: updated, totalFeeIncome: roundMoney(totalFeeIncome), changes, departed };
}

export function getRedemptionThresholdPct(tolerance: RiskTolerance): number {
  return toleranceProfiles[tolerance].redemptionDrawdown;
}

export function getWeeklyFeeRate(tolerance: RiskTolerance): number {
  return toleranceProfiles[tolerance].weeklyFeeRate;
}

export function getPerformanceBeta(tolerance: RiskTolerance): number {
  return toleranceProfiles[tolerance].performanceBeta;
}

/** Convenience: roll a fresh roster on a fresh run state. */
export function attachClientsOnPromotion(run: RunState, newTier: CareerTier, rng: Rng): RunState {
  const targetCount = clientCountByTier[newTier];
  if (targetCount === 0) return run;
  const clients = generateClientsForTier(newTier, rng, run.clients);
  if (clients.length === run.clients.length) return run;
  const newCount = clients.length - run.clients.length;
  return {
    ...run,
    clients,
    weekLog: [
      ...run.weekLog,
      `${newCount === 1 ? 'A new client' : `${newCount} new clients`} signed on at ${newTier.replaceAll('_', ' ')}.`
    ]
  };
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
