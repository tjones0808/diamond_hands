# Career Roguelite Trader Ideas

## Recently Shipped

- Stock Intel panel (signal quality, volatility, sparkline, thesis line)
- Trade Ticket with size inputs, cost/risk estimates, buy/sell/close
- Weekly Goals tied to promotion gates
- Win/Loss Feedback: Friday recap modal with per-option P/L, Wednesday shock echo, lesson line, promotion banner
- Onboarding First Week: 6-step coachmark tutorial with auto-advance and Skip button
- Promotion Moment + Persistent Room Artifacts (trophy shelf, Phaser artifacts, starting perks)
- Sound Design: 13 synthesized Web Audio SFX; 🔊/🔇 mute toggle persisted to save
- Boss Weeks: themed Friday tests gate every promotion; live progress bar; recap shows passed/failed
- Roguelite Meta / Run Journal: 10 lifetime stats, last 8 runs logged, toggleable journal modal
- Charts + Fundamentals + Technicals + News: 20-bar candlestick chart with MA + S/R, 12-card fundamentals tab, 12-card technicals tab, generated news headlines per ticker, analyst rating pill, short interest, 52W range
- Trading-style rewards: Balanced Trader reputation bonus, F/T splits in the Run Journal
- Risk/Mood System: stress/confidence on RunState; affects premium quotes and HUD mood pill
- Margin & Leverage: tier-keyed multiplier (1x→5x), buying power on trade ticket, daily interest, auto-paydown on share sale
- Tutorial spotlight with proper SVG clip-path cutout — sharp inside, blurred outside, `keepSharp` array per step keeps multiple regions interactive
- 100× contract multiplier on options — real-world cost math
- Per-week market generation with continuity (last Friday close → new Monday open) + future-day shadows removed from the chart
- Weekly recap deltas measure Monday-open → Friday-close, not Friday-morning → Friday-night
- Procedural music engine per career tier (5 unique chord progressions / tempos / vibes) replacing the ambient hum
- Run Journal modal rendered via portal so it sits above the trading terminal
- Right-rail layout: Positions, Weekly Goals, and Career Upgrade card always visible at 100% zoom
- Stop Losses + Limit Orders: resting orders sweep against day high/low each day-advance; inline form in the Trade Ticket; pending orders show in the right rail with cancel buttons
- Room Upgrade Effects: Second Monitor unlocks a volume-bars panel under the candlestick chart; Better News Feed unlocks a Tuesday-night "Wednesday whisper" sector hint
- Career Tier Unlocks: Limit orders unlock at Stock Broker, Stop Losses at Fund Manager. Stock Broker tier and above pay a $0.005-per-share commission. Margin daily interest scales down at Fund Manager (0.05%) and Hedge Fund Founder (0.02%).
- **Client Portfolio**: promotions to Stock Broker spawn 2 clients with names, backstories, and risk tolerances. Each Friday their balance moves with your weekly performance × their beta, they pay you a weekly management fee deposited to cash, and they redeem if drawdown breaches their threshold or patience hits zero. Scales up at Fund Manager (4 clients, larger AUM) and Hedge Fund Founder (5 clients). Client roster shows in the right rail with balance, patience meter, and redemption hint.
- **Content expansion**: 20 tickers (was 10), 35 event cards (was 21). Each ticker has a 4-beat recurring narrative arc that cycles seed-deterministically across weeks so a ticker has a memorable storyline.
- **Settings Panel**: gear icon in the market tape opens a modal with SFX + music volume sliders, reduced-motion toggle, colorblind palette toggle, replay-tutorial action, and a reset-save destructive action. Settings persist in save.
- **Daily Loss Limits at Prop Desk**: HUD shows live daily loss vs $1500 cap. Each breach is a strike (-4 reputation); three strikes in a run and the desk fires you (bankruptcy). Resets on every new day.
- **Rival Traders**: 3 named rivals generated per run with personality-based weekly random walks. Leaderboard in the Run Journal shows your rank vs them. Rivals react to your big wins/losses with named jeers, cheers, or brags.
- **Insider Trading Temptation**: random Monday tip event from week 2+. Accept for a guaranteed Wednesday shock prediction, but ~22% chance of an SEC investigation on Friday: cash fine ($1,500 + 8% of cash) + reputation hit (-8). Decline for +1 reputation. Tip and SEC modals stack properly with the recap.

## Backlog

### Gameplay depth
- **Covered Calls + naked short options**: requires share-position constraint. Sell calls against held shares for income; risk capped by stock ownership.
- **Order book depth / bid-ask spread**: bid + ask instead of single mid-market price. Higher spread for low-quality / low-volume tickers. Affects slippage.
- **Stop / limit on options too** (currently shares only).
- **Intraday auto-execution at Hedge Fund Founder tier**: stops fire mid-day, not just on day-advance.

### Pressure systems
- **AUM + LP letters at Fund Manager tier**: bigger pool of capital is already there with 4 clients; need quarterly LP review modal with redemption mechanics.
- **Daily loss limits at Prop Desk**: get fired if a single day drops more than $X.
- **Insider trading / regulatory risk**: temptation system — trade on a tip for outsize gains, risk an SEC penalty.

### Content depth
- **More events**: cards themed by tier (e.g. Fed weeks more common at higher tiers).
- **Market Personality**: deeper recurring lore arcs beyond the 4-beat per-ticker cycle.
- **Rival Traders**: 2-3 named rivals on a leaderboard who react to your biggest wins and blowups.
- **Bigger watchlist at Prop Desk+**: currently fixed at 8 tickers; could scale to 10–12 at higher tiers (now have 20 in the pool).

### Polish + accessibility
- **Keyboard Shortcuts**: 1-8 to select tickers, Space for Advance Day, B/S for buy/sell, C for close, M for mute, J for journal, Esc to dismiss modals.
- **Bundle splitting**: Phaser dynamic-import + manualChunks. 1.7MB initial load is a deal-breaker for first impressions.
- **Mobile / responsive polish**: the game is desktop-only at narrow widths.
- **Endgame Wall Street Floor**: dense command-center Phaser scene at Hedge Fund Founder, institutional-scale trades.
