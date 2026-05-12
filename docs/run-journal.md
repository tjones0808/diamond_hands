# Run Journal / Roguelite Meta

The save now tracks lifetime stats and a rolling history of the last 8 completed runs. Surfaces in a Journal panel toggled from the room.

## Stats tracked

```ts
interface LifetimeStats {
  totalRuns: number;
  totalBankruptcies: number;
  totalPromotions: number;
  totalBossWeeksPassed: number;
  totalBossWeeksFailed: number;
  totalWeeksSurvived: number;
  biggestSingleWeekGain: number;
  biggestSingleWeekLoss: number; // negative number
}
```

`SaveState` also carries `recentRuns: RunSummary[]` capped at 8 entries:

```ts
interface RunSummary {
  seed: number;
  endedAtWeek: number;
  endedTier: CareerTier;
  endNetWorth: number;
  endedInBankruptcy: boolean;
  endedAt: string;
}
```

## Update rules (`src/save/runJournal.ts`)

- `applyWeekResultToStats(stats, weekResult)` runs on every Friday settle. Increments `totalWeeksSurvived`, `totalPromotions` if applicable, boss pass/fail counters, and updates the biggest-gain / biggest-loss high-water marks against `weekResult.netWorthDelta`.
- `recordBankruptcy(stats)` increments `totalBankruptcies`.
- `appendRunSummary(save, run, endNetWorth)` prepends a new `RunSummary` to `recentRuns` and trims to 8.

Wiring lives in `src/game/reducer.ts` — Friday settle calls `applyWeekResultToStats` always, then if the resulting run becomes bankrupt for the first time it also calls `recordBankruptcy`, increments `runsCompleted`, and appends a summary.

## UI

`src/ui/RunJournal.tsx` renders a `📓 Journal` button in the top-right corner of the room panel. Clicking opens a modal with:

- A grid of 10 stat cards (lifetime stats + best net worth + highest tier).
- A "Recent runs" list with week, ending tier, status (Bankrupt / Continued), and final net worth.

Closing the modal: click the X, click the backdrop, or any keyboard escape via blur.

## Tests

`src/save/runJournal.test.ts` (5 tests): week counter increments, biggest-gain and biggest-loss tracking, boss-pass/fail counters, promotion counter, bankruptcy counter.
