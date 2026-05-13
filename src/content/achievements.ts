import type { RunState, SaveState, WeekResult } from '../game/types';

export interface AchievementContext {
  run: RunState;
  save: SaveState;
  weekResult?: WeekResult;
  /** Set when an action resolves: 'WEEK_END' | 'RUN_END' | 'TRADE'. */
  trigger: 'WEEK_END' | 'RUN_END' | 'TRADE';
}

export interface AchievementDefinition {
  id: string;
  label: string;
  description: string;
  /** Returns true on the moment this should unlock. */
  check: (ctx: AchievementContext) => boolean;
}

export const achievementDefinitions: AchievementDefinition[] = [
  {
    id: 'first-green-friday',
    label: 'First Green Friday',
    description: 'Close your first week in the green.',
    check: ({ weekResult }) => weekResult ? weekResult.netWorthDelta > 0 : false
  },
  {
    id: 'big-week',
    label: 'Big Week',
    description: 'Finish a week with a net-worth gain over $2,500.',
    check: ({ weekResult }) => weekResult ? weekResult.netWorthDelta >= 2500 : false
  },
  {
    id: 'option-master',
    label: 'Premium Collector',
    description: 'Earn $1,000+ in options P/L in a single week.',
    check: ({ weekResult }) => weekResult ? weekResult.optionsTotalPnl >= 1000 : false
  },
  {
    id: 'boss-slayer',
    label: 'Boss Slayer',
    description: 'Pass your first boss week.',
    check: ({ weekResult }) => weekResult?.bossResolution?.passed === true
  },
  {
    id: 'first-promotion',
    label: 'Up the Ladder',
    description: 'Promote to Prop Desk Rookie.',
    check: ({ weekResult }) => weekResult?.promoted === true
  },
  {
    id: 'broker',
    label: 'Got Clients',
    description: 'Promote to Stock Broker.',
    check: ({ run }) => run.tier === 'STOCK_BROKER' || run.tier === 'FUND_MANAGER' || run.tier === 'HEDGE_FUND_FOUNDER'
  },
  {
    id: 'fund-manager',
    label: 'Suit and Tie',
    description: 'Promote to Fund Manager.',
    check: ({ run }) => run.tier === 'FUND_MANAGER' || run.tier === 'HEDGE_FUND_FOUNDER'
  },
  {
    id: 'top-of-the-tower',
    label: 'Top of the Tower',
    description: 'Reach Hedge Fund Founder.',
    check: ({ run }) => run.tier === 'HEDGE_FUND_FOUNDER'
  },
  {
    id: 'balanced-trader',
    label: 'Balanced Trader',
    description: 'Earn the Balanced Trader bonus.',
    check: ({ weekResult }) => weekResult?.balancedTrader === true
  },
  {
    id: 'iron-stomach',
    label: 'Iron Stomach',
    description: 'Survive a week with a net-worth drop of $2,500 or more without going bankrupt.',
    check: ({ weekResult, run }) => weekResult ? (weekResult.netWorthDelta <= -2500 && !run.isBankrupt) : false
  },
  {
    id: 'comeback-kid',
    label: 'Comeback Kid',
    description: 'Recover to positive net-worth delta after starting the week below -$1,500.',
    check: ({ run, weekResult }) => weekResult ? (run.stress > 50 && weekResult.netWorthDelta > 0) : false
  },
  {
    id: 'long-haul',
    label: 'Long Haul',
    description: 'Survive 10 weeks in a single run.',
    check: ({ run, trigger }) => trigger === 'WEEK_END' && run.week >= 10
  },
  {
    id: 'three-strikes',
    label: 'Three Strikes',
    description: 'Get fired from the prop desk (3 daily-loss strikes).',
    check: ({ run }) => run.dailyLossStrikes >= 3
  },
  {
    id: 'clean-conscience',
    label: 'Clean Conscience',
    description: 'Decline an insider tip.',
    check: ({ run, trigger }) => trigger === 'TRADE' ? run.weekLog.some((line) => line.includes('walked away from the tip')) : false
  },
  {
    id: 'dirty-money',
    label: 'Dirty Money',
    description: 'Accept an insider tip and avoid the SEC.',
    check: ({ run, weekResult }) => weekResult ? (!!run.weekLog.find((line) => line.includes('took the tip')) && !run.secInvestigation) : false
  },
  {
    id: 'got-caught',
    label: 'Got Caught',
    description: 'Get pinned by the SEC after acting on a tip.',
    check: ({ run }) => !!run.secInvestigation
  },
  {
    id: 'bankruptcy',
    label: 'Wiped Out',
    description: 'End a run in bankruptcy.',
    check: ({ run, trigger }) => trigger === 'RUN_END' && run.isBankrupt
  },
  {
    id: 'spread-king',
    label: 'Spread Pro',
    description: 'Close any vertical spread profitable on settlement.',
    check: ({ weekResult }) => weekResult ? weekResult.optionResults.some((r) => (r.strategyType === 'CALL_SPREAD' || r.strategyType === 'PUT_SPREAD') && r.pnl > 0) : false
  },
  {
    id: 'straddle-payoff',
    label: 'Volatility Trader',
    description: 'Close a straddle profitable on settlement.',
    check: ({ weekResult }) => weekResult ? weekResult.optionResults.some((r) => r.strategyType === 'STRADDLE' && r.pnl > 0) : false
  },
  {
    id: 'client-millionaire',
    label: 'Wealth Manager',
    description: 'Reach $100,000 in total AUM across all clients.',
    check: ({ run }) => run.clients.reduce((total, c) => total + c.balance, 0) >= 100_000
  }
];

export const achievementById = new Map(achievementDefinitions.map((a) => [a.id, a]));
