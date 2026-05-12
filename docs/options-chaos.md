# Options Chaos Sprint

Expanded the options system from "buy a Friday call/put" to a real strategy vocabulary with multi-leg trades, three expiry days, and theta-aware pricing.

## What the player gets

- **Strategy selector** inline with the Trade Ticket title: Single, Call Spread, Put Spread, Straddle. Single keeps the existing Buy Call / Buy Put behavior.
- **DTE picker** as a row of TUE/THU/FRI radio buttons. Only future expiries from the current day are offered (e.g. on WED you can pick THU or FRI).
- **Theta-aware premiums.** `estimatePremium` now takes a `remainingDays` arg and scales the time-value component by `sqrt(days/5)`. A Tuesday-expiry call bought on Monday costs noticeably less than a Friday-expiry call, but it also has less time to be right.
- **Defined-risk spreads.** Call/Put spreads open a long leg at ATM-ish and a short leg further OTM. The short leg's premium credit offsets the long leg's cost — the ticket displays the net debit and the spread's max profit so the player can see the box.
- **Straddles.** Long call + long put at the same strike. Pays on big moves either direction. The ticket shows the break-even distance.

## Architecture

- New `OptionSide`, `OptionExpiryDay`, `OptionStrategyType` types on `OptionContract`. Existing code paths default to `LONG / FRI / SINGLE_*` so older tests keep working.
- `src/trading/tradingEngine.ts` `openMultiLegOptions()` handles any 1–N leg strategy. SHORT legs *credit* the cash at open and *debit* it at settle if ITM. Each leg shares a `strategyId` so the recap can group them.
- `settleExpiringOptions(run, day, prices)` settles only options whose `expiresDay === day`. Called at every day-end in the reducer, so TUE expiries clear before Wednesday's shock, THU expiries clear before Friday.
- Settled legs are accumulated on `run.weekOptionResults` across the week. The Friday recap reads from this array (cleared on week wrap).
- `closeOptionsForSymbol` now respects remaining days when marking — closing a TUE-expiry on MON gets less than closing a FRI-expiry on MON.

## Tests added

- `tradingEngine.test.ts` (+4): call spread net debit + leg grouping, deep-ITM spread settlement, per-day settle scope, straddle profitable both directions.
- E2E (+2): open a call spread and see grouped legs in the recap; pick a Tuesday expiry and watch it settle before the Wednesday shock fires.

## What changed for older code paths

- `buyCall` / `buyPut` now take an optional `expiresDay` arg defaulting to `'FRI'`.
- `OptionContract.expiresDay` is now the union `'TUE' | 'THU' | 'FRI'` rather than the literal `'FRI'`.
- `settleOptions` is preserved as a Friday-batch helper but the reducer drives per-day settlement directly via `settleExpiringOptions`.
- Trade log copy changed from `Bought 1 NVRA CALL 55.` to `Opened CALL on NVRA (FRI expiry, debit $3.00).` and similar.
