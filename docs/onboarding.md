# Onboarding Sprint

A 6-step guided first run that spotlights key UI, explains it in plain English, and skips itself on every subsequent run.

## Player experience

On first launch (no save, or `save.hasCompletedTutorial === false`):

1. **This is your run status** — spotlights the HUD, names cash / net worth / reputation / XP / regime.
2. **Read the tape** — spotlights Stock Intel, explains Signal Quality vs Volatility.
3. **Pick your strategy** — spotlights Trade Ticket, names the new strategies (Single / Spread / Straddle) and the DTE picker.
4. **Advance the day** — spotlights the Advance Day button. Auto-advances when the Wednesday shock fires.
5. **The Wednesday shock** — spotlights the active event card. Auto-advances when the Friday recap appears.
6. **Friday tells the story** — spotlights the recap modal. The button switches to "Start trading" and closes the tutorial.

A `Skip tutorial` link sits in every step's header. Either Skip or completing step 6 sets `save.hasCompletedTutorial = true`, persisted in localStorage. Repeat runs never see the coachmark.

## Architecture

- `src/onboarding/tutorialSteps.ts` — pure list of step descriptors `{ id, target, title, body, placement, autoAdvance?, isComplete? }`. `target` is a CSS selector; `isComplete` is a `RunState => boolean` predicate.
- `src/onboarding/Coachmark.tsx` — overlay component that:
  - Renders a fixed-position, pointer-events:none layer so the game underneath stays interactive.
  - Measures the target element with `getBoundingClientRect` in a `useLayoutEffect`, re-running on day/event/recap changes.
  - Renders a CSS-box-shadow "spotlight" that cuts a hole in the dim backdrop around the target.
  - Positions a tooltip on the chosen side (`top` / `bottom` / `left` / `right`) with `Next` or "Continue playing to advance." copy.
  - Auto-fires the step's `isComplete` against the current run on every render and advances when true.
- New `COMPLETE_TUTORIAL` reducer action flips `save.hasCompletedTutorial`. The Coachmark calls `onComplete` when the player hits Skip or finishes step 6.
- The `SaveState` interface gained `hasCompletedTutorial: boolean`. `createInitialSave()` defaults it to `false`. `loadSave()` keeps existing saves valid by merging with defaults.

## Tests

- `onboarding > first-time player sees the tutorial and can skip it`: clears the save, asserts the dialog and step 1 copy, advances one step, hits Skip, checks `localStorage` shows the flag.
- `onboarding > tutorial auto-advances to the Wednesday shock step when the player advances days`: walks through steps 1–3 with `Got it`, then clicks Advance Day twice and asserts the shock step is visible.

The other 5 e2e tests use a `beforeEach` that pre-seeds the save with `hasCompletedTutorial: true` so the tutorial doesn't gate gameplay assertions.

## What this unlocks next

- The step list is data, not code paths. New skills (covered calls, hedging, promotions) get a tutorial step by appending to `tutorialSteps`.
- The `Coachmark` overlay can be re-used as a generic "tip of the day" or boss-week intro by lifting the `active` toggle out of save state and into a per-event flag.
