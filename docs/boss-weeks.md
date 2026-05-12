# Boss Weeks

Promotion is no longer passive. To advance a tier the player must trigger and pass a themed Friday test.

## Trigger conditions

On Monday of any week, if the player meets *all three* promotion gate requirements for their current tier (net worth, reputation, XP) and is eligible for a next tier (i.e. not at HEDGE_FUND_FOUNDER), `isBossEligible(run)` returns true and the reducer attaches a `BossWeekState` to the run. A `bossReveal` SFX plays.

## What the boss demands

Each tier has a `BossWeekDefinition` in `src/career/bossWeek.ts`:

| Tier | Title | Demand |
|---|---|---|
| Bedroom Day Trader | Prop Desk Audition | End Friday with 1.06× gate net worth |
| Prop Desk Rookie | Daily Loss Limit Test | End Friday with 1.07× gate net worth |
| Stock Broker | Client Trust Review | End Friday with 1.08× gate net worth |
| Fund Manager | Quarterly Investor Letter | End Friday with 1.09× gate net worth |

The target scales with tier — passing requires growth beyond the bare gate.

## Friday resolution

When the boss week is active, `resolveBossWeek(definition, endNetWorth)` runs in the reducer's Friday path:

- **Passed**: +5 reputation, promotion fires (`evaluatePromotion` is gated by `bossResolution.passed`), the recap shows a green `recap-boss--passed` block with the new tier banner, trophy callout, and starting perk preview for the *next* run.
- **Failed**: tier-scaled reputation penalty (-3 to -6), tier-scaled cash penalty ($0 to $4,000), no promotion. The recap shows a red `recap-boss--failed` block with the shortfall.

Either way, the boss is consumed for the week. The player must re-qualify on a future Monday to trigger another attempt.

## UI

- `BossWeekBanner` sits at the top of the trading-controls column with a pulsing red outline, the boss title and intro, and a progress bar showing current net worth versus the target.
- The WeekRecap modal gains a `recap-boss--passed` or `recap-boss--failed` section above the promotion block.

## Tests

- `src/career/bossWeek.test.ts` (6 tests) — eligibility predicates and resolution math.
- `src/game/reducer.test.ts` (3 tests touching boss flow) — passing the bar promotes and stamps the recap; failing applies the penalty and leaves the tier; without a boss week, Friday cannot promote even if every gate is cleared (you simply arm next week's boss).
