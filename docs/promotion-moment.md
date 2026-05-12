# Promotion Moment + Persistent Room Artifacts

Career progression now leaves a permanent fingerprint on the save. Every cleared tier earns a trophy that survives bankruptcy, the next run starts with a small perk, and the recap modal makes the promotion feel earned.

## Player experience

When Friday settles and the player clears a career gate:

- The recap's promotion section gets a **bold gold-bordered banner** with a one-shot pulse animation, the new tier in caps, and a "FROM → TO" tier track.
- A **New Trophy** callout names the artifact and gives it lore: "Rookie Trophy — A small brass cup the desk gave you when you survived your first month."
- A **Next run starts with** callout previews the persistent perk (e.g. "Broker reputation: +$1,000 and +3 starting rep.").

Outside of the recap, a **Trophy Shelf** widget sits in the bottom-right of the room panel, showing all 5 tier slots. Unlocked tiers show their icon + label; locked tiers show `???` and a tooltip pointing to the gate. The shelf survives bankruptcy because it reads from `save.tiersEverReached`.

Inside the Phaser room scene, each unlocked tier draws a small artifact on or near the desk: a mug, a brass trophy, a nameplate, a framed press clipping, a bronze bull. The room visibly fills up as the player climbs.

On every subsequent run, the starting state reads `save.highestTier` and applies the matching perk via `getStartingPerk(highest)`:

| Highest ever reached | Bonus |
|---|---|
| BEDROOM_DAY_TRADER | none |
| PROP_DESK_ROOKIE | +$500 cash |
| STOCK_BROKER | +$1,000 cash, +3 reputation |
| FUND_MANAGER | +$1,750 cash, +5 reputation |
| HEDGE_FUND_FOUNDER | +$2,500 cash, +8 reputation |

The starter perk is announced in the week log on day one (`"Broker reputation: +$1,000 and +3 starting rep."`) so the player sees it right away.

## Architecture

- `SaveState` gained `tiersEverReached: CareerTier[]` and `highestTier: CareerTier`. `loadSave()` already merges loaded JSON with `createInitialSave()` defaults so older saves get the new fields with sane values.
- `WeekResult` gained `promotedFromTier`, `newArtifact: TierArtifact`, and `nextRunPerk: StartingPerk`. The reducer's Friday path computes them all and they're packaged into the recap.
- `src/content/tierRewards.ts` owns the artifact catalogue, `highestTier(...tiers)` reducer-friendly comparator, and the `getStartingPerk(highest)` lookup.
- `createInitialGameState(seed, save)` reads `save.highestTier` and applies the perk to starting cash + reputation, prepending the perk description to the week log.
- `src/scene/RoomScene.ts` `drawArtifacts(...)` runs after the desk is drawn and adds one small Phaser GameObject per tier in `save.tiersEverReached`. Cheap rectangles + ellipses + text — no spritesheets needed.
- `src/ui/TrophyShelf.tsx` renders a deterministic 5-row list with `data-tier` and `data-unlocked` attributes so e2e tests can assert state without inspecting canvas pixels.

## Tests

Unit:
- `src/content/tierRewards.test.ts` — highest-tier comparator, starting perk lookup, artifact catalogue completeness (7 tests).
- `src/game/reducer.test.ts` — promotion records the new tier in save, does not duplicate, attaches artifact + perk to the recap, starting perk applied to fresh run state (4 tests).

E2E:
- `trophy shelf > shows a single unlocked trophy for a fresh save` — asserts `1/5` and locked rows show `???`.
- `trophy shelf > shows persistent unlocks from prior runs and the starter perk applies` — pre-seeds a save reaching STOCK_BROKER, asserts shelf shows `3/5`, named artifacts ("Rookie Trophy", "Brass Nameplate"), and HUD cash reads `$6,000` thanks to the broker perk.

## What this unlocks next

The save now persistently tracks player accomplishments. Natural follow-ons from the ideas backlog:

- **Roguelite Meta**: career badges, run journal, achievement-style milestones. The `tiersEverReached` shape is the seed for a richer "lifetime stats" surface.
- **Rival Traders**: rivals can react to specific tier unlocks ("Marco showed up at your Hedge Fund Founder launch.").
- **Room Upgrade Effects**: per-tier room palette + the trophies should compose; current room palette swap on promotion already works, artifacts now stack on top.
