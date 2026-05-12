# Win/Loss Feedback Sprint

Shipped: Friday recap modal that turns each market week into a readable story instead of a scrolling log entry.

## What the player sees

When the player clicks **Settle Expiry** on Friday, a modal takes over the screen with:

- **Headline** chosen from the week's net-worth move ("You printed.", "Tape buried you.", "Premium burnt.", etc.) and a giant signed net-worth delta.
- **Option Expiries** list: each contract shows symbol, type, strike, quantity, premium risked, and signed P/L with an in-the-money / expired-worthless tag.
- **Wednesday shock echo** when a market event fired this week, including which symbol got hit.
- **Meta strip**: cash delta, reputation delta, XP gained, total options P/L.
- **Promotion banner** when this Friday closed a career gate.
- **Lesson line** that names the biggest winner and biggest loser by symbol so the player knows why the week worked or didn't.
- **Take Monday** button to dismiss and roll into the new week.

## Architecture

Game rules stayed in deterministic modules. The recap is computed inside the reducer at Friday settle, before the day advances.

- `src/game/types.ts` adds `OptionResult` and `WeekResult` plus `weekResult?: WeekResult` on `RunState`.
- `src/week/weekRecap.ts` exports `buildWeekResult(input)` — pure function that takes pre/post snapshots, the options at settle, final prices, the active event, and promotion info, and returns a fully formed `WeekResult` including computed `headline` and `lesson` strings.
- `src/game/reducer.ts` snapshots net worth, cash, reputation, XP, and the options book *before* `settleOptions`, then builds the recap and stashes it on the run.
- `DISMISS_RECAP` action clears `weekResult` when the player hits **Take Monday**.
- `src/ui/WeekRecap.tsx` renders the modal. It is a noop when `weekResult` is undefined or the run is bankrupt (so post-run summary takes over instead).

## Event deck

The deck in `src/content/events.ts` grew from 4 to 21 cards across all six sectors, with a mix of broad-market shocks (Fed Hot Mic, CPI Hot, Recession Scare) and sector-targeted ones (FDA Rejection, AI Spend Surge, OPEC Surprise Cut, Shipping Crunch). Each Wednesday still draws a single event seeded by `seed + week * 97`, so a given run produces the same shock sequence — but now you can play far more weeks before a card repeats.

## Tests

- `src/week/weekRecap.test.ts` covers the pure builder: per-option P/L, headline copy, lesson naming the winner, promotion flag, and event echo.
- `tests/first-playable.spec.ts`:
  - Smoke test now asserts the recap dialog appears, dismisses it, then checks the next week starts.
  - New test `Friday recap names the trade, the shock, and lets the player continue` buys a call and a put, runs the full week, and verifies both contracts and the Wednesday shock appear in the recap with a signed P/L value.

## Playwright default viewport

Bumped to 1440×900 in `playwright.config.ts`. The previous default of 1280×720 hit the responsive media query and produced a layout where `.positions` overlapped the trade buttons, breaking the smoke test. The wide-layout test still pins its own 1905×768 viewport.

## What this unlocks next

The recap is the surface we'll need for:

- **Boss week** outcomes (replace `headline` and `lesson` with themed copy).
- **Rival trader** reactions ("Marco posted +$8,400 this week").
- **Roguelite meta** end-of-run summaries (the recap shape generalizes to a multi-week tape).

Next sprint candidates per `docs/ideas.md`: Options Chaos Upgrade (DTE/decay/spreads) or Promotion Moment (room flash on tier change).
