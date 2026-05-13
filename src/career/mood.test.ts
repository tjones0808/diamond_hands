import { describe, expect, it } from 'vitest';
import { applyMoodAfterWeek, getMoodEffects } from './mood';
import type { RunState } from '../game/types';

const baseRun: RunState = {
  seed: 1,
  week: 1,
  day: 'MON',
  tier: 'BEDROOM_DAY_TRADER',
  cash: 5000,
  reputation: 40,
  xp: 0,
  marketRegime: 'CALM',
  tickers: [],
  sharePositions: [],
  optionPositions: [],
  isBankrupt: false,
  weekLog: [],
  weekOptionResults: [],
  fundamentalScore: 0,
  technicalScore: 0,
  weekFundamentalScore: 0,
  weekTechnicalScore: 0,
  stress: 0,
  confidence: 0,
  marginUsed: 0,
  tickerSeries: {},
  weekStartNetWorth: 5000,
  weekStartCash: 5000,
  restingOrders: [],
  clients: [],
  dayStartNetWorth: 5000,
  dailyLossStrikes: 0,
  rivals: [],
  lpNetWorthHistory: []
};

describe('applyMoodAfterWeek', () => {
  it('adds stress on a big loss week', () => {
    const after = applyMoodAfterWeek(baseRun, -2000, undefined);
    expect(after.stress).toBeGreaterThan(20);
    expect(after.confidence).toBe(0);
  });

  it('adds confidence on a big winning week', () => {
    const after = applyMoodAfterWeek(baseRun, 1700, undefined);
    expect(after.confidence).toBeGreaterThan(15);
  });

  it('amplifies stress when the boss week is failed', () => {
    const noBoss = applyMoodAfterWeek(baseRun, -800, undefined);
    const failedBoss = applyMoodAfterWeek(baseRun, -800, false);
    expect(failedBoss.stress).toBeGreaterThan(noBoss.stress);
  });

  it('decays previous mood toward zero each week', () => {
    const stressed = { ...baseRun, stress: 80 };
    const after = applyMoodAfterWeek(stressed, 50, undefined);
    expect(after.stress).toBeLessThan(80);
  });
});

describe('getMoodEffects', () => {
  it('returns a calm baseline at zero mood', () => {
    const m = getMoodEffects({ stress: 0, confidence: 0 });
    expect(m.label).toBe('CALM');
    expect(m.premiumMultiplier).toBeCloseTo(1, 2);
    expect(m.signalQualityMultiplier).toBeCloseTo(1, 2);
  });

  it('widens premiums and dims signal under heavy stress', () => {
    const m = getMoodEffects({ stress: 90, confidence: 0 });
    expect(m.premiumMultiplier).toBeGreaterThan(1.1);
    expect(m.signalQualityMultiplier).toBeLessThan(0.9);
    expect(m.label).toBe('RATTLED');
  });

  it('tightens premiums and boosts signal under high confidence', () => {
    const m = getMoodEffects({ stress: 0, confidence: 90 });
    expect(m.premiumMultiplier).toBeLessThan(1);
    expect(m.signalQualityMultiplier).toBeGreaterThan(1);
    expect(m.label).toBe('SHARP');
  });
});
