import type { BossWeekDefinition, BossWeekResolution, CareerTier, RunState } from '../game/types';
import { careerGates, getCareerGate } from './careerEngine';
import { getNetWorth } from '../game/selectors';

const bossDefinitions: Record<CareerTier, BossWeekDefinition | undefined> = {
  BEDROOM_DAY_TRADER: {
    forTier: 'BEDROOM_DAY_TRADER',
    title: 'Prop Desk Audition',
    intro: 'A prop-desk recruiter is watching this week. Prove you can grow, not just hold.',
    netWorthTarget: Math.round(getGateNetWorth('BEDROOM_DAY_TRADER') * 1.06),
    requirementSummary: `End Friday with $${formatThousands(Math.round(getGateNetWorth('BEDROOM_DAY_TRADER') * 1.06))} net worth.`,
    failurePenalty: { reputation: -3, cash: 0 }
  },
  PROP_DESK_ROOKIE: {
    forTier: 'PROP_DESK_ROOKIE',
    title: 'Daily Loss Limit Test',
    intro: 'The desk manager wants discipline. Hit a higher water mark by Friday.',
    netWorthTarget: Math.round(getGateNetWorth('PROP_DESK_ROOKIE') * 1.07),
    requirementSummary: `End Friday with $${formatThousands(Math.round(getGateNetWorth('PROP_DESK_ROOKIE') * 1.07))} net worth.`,
    failurePenalty: { reputation: -4, cash: -500 }
  },
  STOCK_BROKER: {
    forTier: 'STOCK_BROKER',
    title: 'Client Trust Review',
    intro: 'Compliance is reading your tape this week. Make a clean, decisive week.',
    netWorthTarget: Math.round(getGateNetWorth('STOCK_BROKER') * 1.08),
    requirementSummary: `End Friday with $${formatThousands(Math.round(getGateNetWorth('STOCK_BROKER') * 1.08))} net worth.`,
    failurePenalty: { reputation: -5, cash: -1500 }
  },
  FUND_MANAGER: {
    forTier: 'FUND_MANAGER',
    title: 'Quarterly Investor Letter',
    intro: 'Your LPs want a number. This week is your printed quarterly.',
    netWorthTarget: Math.round(getGateNetWorth('FUND_MANAGER') * 1.09),
    requirementSummary: `End Friday with $${formatThousands(Math.round(getGateNetWorth('FUND_MANAGER') * 1.09))} net worth.`,
    failurePenalty: { reputation: -6, cash: -4000 }
  },
  HEDGE_FUND_FOUNDER: undefined
};

export function getBossDefinition(tier: CareerTier): BossWeekDefinition | undefined {
  return bossDefinitions[tier];
}

export function isBossEligible(run: RunState): boolean {
  const gate = getCareerGate(run.tier);
  if (!gate.nextTier) return false;
  if (!bossDefinitions[run.tier]) return false;
  const netWorth = getNetWorth(run);
  return netWorth >= gate.requiredNetWorth
    && run.reputation >= gate.requiredReputation
    && run.xp >= gate.requiredXp;
}

export function resolveBossWeek(boss: BossWeekDefinition, endNetWorth: number): BossWeekResolution {
  const passed = endNetWorth >= boss.netWorthTarget;
  const shortfall = passed ? 0 : Math.round((boss.netWorthTarget - endNetWorth) * 100) / 100;
  const reputationDelta = passed ? 5 : boss.failurePenalty.reputation;
  const cashDelta = passed ? 0 : boss.failurePenalty.cash;
  const summary = passed
    ? `Passed ${boss.title}. Net worth $${formatThousands(Math.round(endNetWorth))} cleared the $${formatThousands(boss.netWorthTarget)} bar.`
    : `Failed ${boss.title}. Short by $${formatThousands(shortfall)}.`;

  return { passed, endNetWorth: Math.round(endNetWorth * 100) / 100, shortfall, reputationDelta, cashDelta, summary };
}

function getGateNetWorth(tier: CareerTier) {
  return careerGates.find((gate) => gate.tier === tier)?.requiredNetWorth ?? 5000;
}

function formatThousands(value: number) {
  return value.toLocaleString();
}
