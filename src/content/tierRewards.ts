import type { CareerTier, StartingPerk, TierArtifact } from '../game/types';

export const tierArtifacts: Record<CareerTier, TierArtifact> = {
  BEDROOM_DAY_TRADER: {
    tier: 'BEDROOM_DAY_TRADER',
    label: 'Starter Mug',
    description: 'A chipped mug from your first weekend of trading. Never throw it out.'
  },
  PROP_DESK_ROOKIE: {
    tier: 'PROP_DESK_ROOKIE',
    label: 'Rookie Trophy',
    description: 'A small brass cup the desk gave you when you survived your first month.'
  },
  STOCK_BROKER: {
    tier: 'STOCK_BROKER',
    label: 'Brass Nameplate',
    description: 'BROKER stamped on brass. Clients see it. So do you.'
  },
  FUND_MANAGER: {
    tier: 'FUND_MANAGER',
    label: 'Framed Press Clipping',
    description: 'A trade magazine called you "one to watch." You read it twice a week.'
  },
  HEDGE_FUND_FOUNDER: {
    tier: 'HEDGE_FUND_FOUNDER',
    label: 'Bull Statue',
    description: 'A bronze bull, looking smug. You earned the smugness.'
  }
};

const careerOrder: CareerTier[] = [
  'BEDROOM_DAY_TRADER',
  'PROP_DESK_ROOKIE',
  'STOCK_BROKER',
  'FUND_MANAGER',
  'HEDGE_FUND_FOUNDER'
];

export function highestTier(...tiers: CareerTier[]): CareerTier {
  return tiers.reduce<CareerTier>((highest, current) => {
    return careerOrder.indexOf(current) > careerOrder.indexOf(highest) ? current : highest;
  }, 'BEDROOM_DAY_TRADER');
}

export function getStartingPerk(highest: CareerTier): StartingPerk {
  switch (highest) {
    case 'PROP_DESK_ROOKIE':
      return { bonusCash: 500, bonusReputation: 0, description: 'Prop Desk veteran: +$500 starter capital.' };
    case 'STOCK_BROKER':
      return { bonusCash: 1000, bonusReputation: 3, description: 'Broker reputation: +$1,000 and +3 starting rep.' };
    case 'FUND_MANAGER':
      return { bonusCash: 1750, bonusReputation: 5, description: 'Fund manager pedigree: +$1,750 and +5 starting rep.' };
    case 'HEDGE_FUND_FOUNDER':
      return { bonusCash: 2500, bonusReputation: 8, description: 'Founder legacy: +$2,500 and +8 starting rep.' };
    case 'BEDROOM_DAY_TRADER':
    default:
      return { bonusCash: 0, bonusReputation: 0, description: 'Standard rookie start.' };
  }
}

export function tierLabel(tier: CareerTier): string {
  switch (tier) {
    case 'BEDROOM_DAY_TRADER': return 'Bedroom Day Trader';
    case 'PROP_DESK_ROOKIE': return 'Prop Desk Rookie';
    case 'STOCK_BROKER': return 'Stock Broker';
    case 'FUND_MANAGER': return 'Fund Manager';
    case 'HEDGE_FUND_FOUNDER': return 'Hedge Fund Founder';
  }
}
