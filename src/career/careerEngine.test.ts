import { describe, expect, it } from 'vitest';
import { applyWeekOutcome, checkBankruptcy, evaluatePromotion, getCareerGate } from './careerEngine';

describe('careerEngine', () => {
  it('marks a run bankrupt when cash falls below zero', () => {
    expect(checkBankruptcy({ cash: -1, isBankrupt: false })).toMatchObject({ isBankrupt: true });
  });

  it('awards XP and reputation for profitable weeks', () => {
    expect(applyWeekOutcome({ cashDelta: 1200, reputation: 40, xp: 0 })).toEqual({ reputation: 43, xp: 2 });
  });

  it('promotes bedroom traders who clear the first gate', () => {
    const result = evaluatePromotion({
      tier: 'BEDROOM_DAY_TRADER',
      xp: 4,
      reputation: 45,
      netWorth: 6500
    });

    expect(result.tier).toBe('PROP_DESK_ROOKIE');
    expect(result.promoted).toBe(true);
  });

  it('does not promote when a gate is missing', () => {
    const result = evaluatePromotion({
      tier: 'BEDROOM_DAY_TRADER',
      xp: 4,
      reputation: 45,
      netWorth: 5900
    });

    expect(result.tier).toBe('BEDROOM_DAY_TRADER');
    expect(result.promoted).toBe(false);
  });

  it('exposes the next career gate', () => {
    expect(getCareerGate('PROP_DESK_ROOKIE')).toMatchObject({
      nextTier: 'STOCK_BROKER',
      requiredNetWorth: 12000
    });
  });
});
