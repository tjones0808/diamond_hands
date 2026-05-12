import { describe, expect, it } from 'vitest';
import { getStartingPerk, highestTier, tierArtifacts } from './tierRewards';

describe('highestTier', () => {
  it('picks the most advanced tier from a list', () => {
    expect(highestTier('BEDROOM_DAY_TRADER', 'STOCK_BROKER', 'PROP_DESK_ROOKIE')).toBe('STOCK_BROKER');
  });

  it('defaults to bedroom day trader when called with no progress', () => {
    expect(highestTier()).toBe('BEDROOM_DAY_TRADER');
  });

  it('returns the maximum even when the highest is at the end', () => {
    expect(highestTier('BEDROOM_DAY_TRADER', 'HEDGE_FUND_FOUNDER')).toBe('HEDGE_FUND_FOUNDER');
  });
});

describe('getStartingPerk', () => {
  it('gives no bonus to a fresh save', () => {
    expect(getStartingPerk('BEDROOM_DAY_TRADER')).toEqual({
      bonusCash: 0,
      bonusReputation: 0,
      description: 'Standard rookie start.'
    });
  });

  it('scales the perk for higher tiers reached', () => {
    expect(getStartingPerk('PROP_DESK_ROOKIE').bonusCash).toBe(500);
    expect(getStartingPerk('STOCK_BROKER').bonusCash).toBe(1000);
    expect(getStartingPerk('FUND_MANAGER').bonusCash).toBe(1750);
    expect(getStartingPerk('HEDGE_FUND_FOUNDER').bonusCash).toBe(2500);
  });

  it('also grants reputation past the prop desk', () => {
    expect(getStartingPerk('STOCK_BROKER').bonusReputation).toBe(3);
    expect(getStartingPerk('HEDGE_FUND_FOUNDER').bonusReputation).toBe(8);
  });
});

describe('tierArtifacts', () => {
  it('defines an artifact for every tier', () => {
    const tiers = ['BEDROOM_DAY_TRADER', 'PROP_DESK_ROOKIE', 'STOCK_BROKER', 'FUND_MANAGER', 'HEDGE_FUND_FOUNDER'] as const;
    for (const tier of tiers) {
      expect(tierArtifacts[tier]).toBeDefined();
      expect(tierArtifacts[tier].label.length).toBeGreaterThan(0);
    }
  });
});
