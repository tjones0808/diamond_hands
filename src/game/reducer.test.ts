import { describe, expect, it } from 'vitest';
import type { BossWeekDefinition, GameState } from './types';
import { createInitialGameState, createInitialSave } from './createInitialState';
import { gameReducer } from './reducer';
import { getBossDefinition } from '../career/bossWeek';

function stateAtFridayWithActiveBossWeek(): GameState {
  const initial = createInitialGameState(20260508);
  const definition = getBossDefinition('BEDROOM_DAY_TRADER') as BossWeekDefinition;

  return {
    save: { ...initial.save },
    run: {
      ...initial.run,
      day: 'FRI',
      cash: definition.netWorthTarget + 1000,
      reputation: 80,
      xp: 12,
      sharePositions: [],
      optionPositions: [],
      weekOptionResults: [],
      bossWeek: { definition, startedAtWeek: 1 }
    }
  };
}

describe('boss week resolution in the reducer', () => {
  it('passes the boss week and promotes when net worth clears the bar', () => {
    const state = stateAtFridayWithActiveBossWeek();
    const next = gameReducer(state, { type: 'ADVANCE_DAY' });

    expect(next.run.weekResult?.bossResolution?.passed).toBe(true);
    expect(next.run.tier).toBe('PROP_DESK_ROOKIE');
    expect(next.save.tiersEverReached).toContain('PROP_DESK_ROOKIE');
  });

  it('fails the boss week and applies penalty when net worth misses', () => {
    const base = stateAtFridayWithActiveBossWeek();
    const target = base.run.bossWeek!.definition.netWorthTarget;
    // The player lost ground from Monday to Friday in this scenario.
    const state: GameState = {
      ...base,
      run: {
        ...base.run,
        cash: target - 800,
        weekStartNetWorth: target + 500,
        weekStartCash: target + 500
      }
    };
    const before = state.run.reputation;

    const next = gameReducer(state, { type: 'ADVANCE_DAY' });

    expect(next.run.weekResult?.bossResolution?.passed).toBe(false);
    expect(next.run.tier).toBe('BEDROOM_DAY_TRADER');
    expect(next.run.reputation).toBeLessThan(before);
  });

  it('does not promote on Friday when no boss week is active', () => {
    const initial = createInitialGameState(20260508);
    const state: GameState = {
      save: { ...initial.save },
      run: {
        ...initial.run,
        day: 'FRI',
        cash: 20000,
        reputation: 90,
        xp: 20,
        sharePositions: [],
        optionPositions: [],
        weekOptionResults: []
      }
    };

    const next = gameReducer(state, { type: 'ADVANCE_DAY' });

    expect(next.run.weekResult?.promoted).toBe(false);
    expect(next.run.tier).toBe('BEDROOM_DAY_TRADER');
    // But the new week should now arm the boss week since gates are met.
    expect(next.run.bossWeek?.definition.forTier).toBe('BEDROOM_DAY_TRADER');
  });
});

describe('weekly recap delta', () => {
  it('measures net-worth delta from the Monday-open baseline, not from Friday morning', () => {
    // Player started the week with $5,000, made $3,000 trading shares earlier in the week,
    // and is now sitting on $8,000 cash with no open positions on Friday morning.
    const initial = createInitialGameState(20260508);
    const state: GameState = {
      save: { ...initial.save },
      run: {
        ...initial.run,
        day: 'FRI',
        cash: 8000,
        weekStartCash: 5000,
        weekStartNetWorth: 5000,
        sharePositions: [],
        optionPositions: [],
        weekOptionResults: []
      }
    };

    const next = gameReducer(state, { type: 'ADVANCE_DAY' });

    expect(next.run.weekResult?.startNetWorth).toBe(5000);
    expect(next.run.weekResult?.netWorthDelta).toBe(3000);
    expect(next.run.weekResult?.cashDelta).toBe(3000);
  });
});

describe('starting perk', () => {
  it('applies extra cash and reputation when the save shows prior promotions', () => {
    const seeded = createInitialSave();
    seeded.highestTier = 'STOCK_BROKER';
    seeded.tiersEverReached = ['BEDROOM_DAY_TRADER', 'PROP_DESK_ROOKIE', 'STOCK_BROKER'];

    const state = createInitialGameState(20260508, seeded);

    expect(state.run.cash).toBe(5000 + 1000);
    expect(state.run.reputation).toBe(40 + 3);
    expect(state.run.weekLog.some((line) => line.includes('Broker reputation'))).toBe(true);
  });
});
