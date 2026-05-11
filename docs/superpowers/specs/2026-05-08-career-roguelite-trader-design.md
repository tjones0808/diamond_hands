# Career Roguelite Trader Design

Date: 2026-05-08

## Summary

Career Roguelite Trader is a single-player browser game about starting as a low-level day trader in a bad bedroom setup and trading your way toward institutional power. The game combines portfolio-building strategy, chaotic options trading, visible lifestyle progression, and roguelite resets.

The target first release is a playable alpha, not a small MVP. The alpha should let the player experience a meaningful climb from bedroom trader to hedge fund founder across multiple market weeks, while preserving the late-game Wall Street legend fantasy for future expansion.

## Design Pillars

1. **Every week tells a trading story.**
   The player forms a thesis, takes positions, reacts to market shocks, and faces Friday expiry.

2. **Strategy matters, but chaos keeps the game alive.**
   The game should reward learning and planning, while still creating volatile, memorable situations.

3. **Progress must be visible.**
   The player should see their room, tools, office, status, and career title change, not just numbers increasing.

4. **Failure should hurt without ending motivation.**
   Bankruptcy ends the current run, but permanent unlocks, knowledge, credentials, and upgrades carry forward.

5. **Trading depth unlocks over time.**
   Early play is accessible. Later tiers add instruments, constraints, bigger capital, and sharper consequences.

## Core Fantasy

The player begins with a weak computer, a bad room, a tiny bankroll, and too much confidence. They trade fictional markets week by week. Good decisions, lucky breaks, and controlled risk help them earn money and reputation. Bad trades, margin pressure, client panic, and options expiry can blow them up.

The long-term fantasy is a climb:

1. Bedroom Day Trader
2. Prop Desk Rookie
3. Stock Broker
4. Fund Manager
5. Hedge Fund Founder
6. Wall Street Legend, reserved as a later expansion or final boss tier

## Core Loop

Each run is built from market weeks.

1. **Monday: Read the Market**
   The player reviews news, volatility, watchlists, earnings, sector conditions, and rumor cards. They choose a thesis for the week.

2. **Tuesday: Build Positions**
   The player allocates cash across shares, options, hedges, and reserves.

3. **Wednesday: Handle Shock**
   A market event hits. Examples include Fed surprises, CEO scandals, short reports, meme squeezes, downgrades, FDA decisions, or sector crashes.

4. **Thursday: Double Down or De-risk**
   The player can roll options, buy insurance, close winners, chase losers, preserve reputation, or take bigger risk.

5. **Friday: Expiry Judgment**
   Options settle, margin is checked, client reactions resolve, reputation changes, and career gates move closer or farther away.

The repeatable loop is:

Trade the week -> survive expiry -> gain or lose cash, reputation, and XP -> upgrade tools, room, and career -> unlock more dangerous opportunities -> eventually blow up or climb higher.

## Playable Alpha Scope

The first release should include enough content to feel like a real run.

### Career Tiers

The alpha includes five playable tiers:

1. **Bedroom Day Trader**
   Small bankroll, bad room, basic shares, calls, puts, rumor boards, personal expenses, and high personal risk.

2. **Prop Desk Rookie**
   Firm capital, manager pressure, daily loss limits, faster data, desk politics, and promotion objectives.

3. **Stock Broker**
   Client accounts, suitability constraints, commissions, referrals, reputation risk, and recurring client personalities.

4. **Fund Manager**
   Assets under management, redemptions, investment mandates, hedging tools, analyst reports, quarterly targets, and institutional scrutiny.

5. **Hedge Fund Founder**
   Office buildout, hiring, leverage, press attention, investor pressure, late-game markets, and severe blowup potential.

The Wall Street Legend tier is designed as a future late-game expansion or final challenge tier.

### Trading Features

The alpha should support:

- Shares
- Calls
- Puts
- Covered calls
- Basic spreads
- Straddles
- Stop losses
- Cash reserves
- Position sizing
- Margin or leverage beginning in later tiers

The game should avoid using live market data in the first release. It should use fictional tickers, fictional sectors, and generated price paths so the game can be balanced for fun.

### Market Content

The alpha should include:

- 20-30 fictional tickers
- Several fictional sectors, such as tech, energy, biotech, housing, defense, consumer, and crypto-adjacent
- Market regimes: calm grind, earnings storm, Fed week, crash watch, melt-up, meme mania, and recession scare
- At least 30 event cards
- Promotion boss weeks where the player must survive a themed crisis

### Life And Status Progression

The alpha should include:

- Room upgrades from bad bedroom to better setup to prop desk to broker office to fund floor
- Gear upgrades such as monitors, better news feed, faster execution, alerts, and analyst subscriptions
- Monthly expenses, rent, lifestyle pressure, office decor, trophies, and status beats
- Rivals, mentors, clients, bosses, and media moments

Progression should be visually represented in the room or office scene wherever possible.

### Roguelite Progression

Bankruptcy ends the run. The player keeps permanent progress such as:

- Licenses
- Market journals
- Mentor contacts
- Starter capital perks
- Room or gear unlocks
- Trading instinct perks
- Trophies and achievement-style milestones
- Optional run modifiers

The intended feeling is that the player fails upward smarter.

## Game Systems

### Simulation State

Simulation state should be independent from rendering and UI. It owns:

- Current run
- Career tier
- Week and day
- Cash
- Positions
- Options contracts
- Tickers and price history
- Event deck
- Reputation
- XP
- Unlocks
- Room and gear upgrades
- Clients, bosses, mentors, and rivals

### Market Generator

The market generator creates fictional prices from:

- Ticker personality
- Sector trend
- Market regime
- Hidden fundamentals
- Public signal quality
- Event shocks
- Volatility level
- Time to option expiry

The player should receive imperfect but useful signals. Outcomes should be uncertain, but not arbitrary.

### Trading Engine

The trading engine validates and resolves:

- Buy and sell orders
- Option premiums
- Expiry settlement
- Position sizing
- Margin and leverage
- P/L calculation
- Cash balance
- Risk warnings
- Client or firm constraints

The early game can use simplified option pricing. The system should still expose concepts like time decay, implied volatility, and strike selection through readable UI.

### Career Engine

The career engine controls:

- Tier requirements
- Promotion gates
- Boss weeks
- Role-specific constraints
- Capital access
- Reputation thresholds
- Tool unlocks
- New trade types
- Life/status changes

Each tier should change the kind of pressure the player feels.

### Event Engine

The event engine draws and resolves:

- Market news
- Rumors
- Macro events
- Company events
- Personal-life pressure
- Client reactions
- Boss demands
- Rival actions
- Media attention

Events should create decisions, not only random damage.

## Interface Design

The game should use a browser-game layout, not a generic finance dashboard.

Recommended structure:

- Phaser canvas for the room, office, character presence, and progression scene
- DOM UI for trading terminal, tickets, menus, modals, and text-heavy surfaces
- A persistent HUD showing cash, reputation, volatility, XP, and current career tier
- A market-week strip showing Monday through Friday and the current day
- A trading terminal with watchlist, positions, chart, signals, and trade ticket
- Collapsible surfaces for journal, upgrades, clients, and career goals

The room or office scene is the trophy case. The terminal is where decisions happen.

## Visual Direction

The visual direction should move from gritty and cramped to polished and powerful:

- Early rooms: dim bedroom, old desk, cheap monitor, messy cables, cheap chair
- Middle tiers: shared trading floor, better monitors, manager presence, busy atmosphere
- Later tiers: glass office, high-rise view, refined terminal, fund floor, press and investor cues

The palette should avoid feeling like a plain SaaS tool. It can use dark terminal surfaces, market greens, warning reds, warm room lighting, and prestige accents that increase with career tier.

## Run Length And Pacing

Target run length for alpha: 15-25 minutes.

A run should contain multiple market weeks. The player should be able to reach several tiers in a strong run, but bankruptcy should remain a real threat.

Weekly pacing:

- Monday and Tuesday are planning-heavy.
- Wednesday introduces uncertainty.
- Thursday creates temptation.
- Friday delivers consequences.

## Failure States

Primary failure state:

- Bankruptcy or forced liquidation ends the run.

Secondary failure pressures:

- Reputation collapse
- Client loss
- Desk firing
- Investor redemptions
- Regulatory or suitability penalties in broker/fund tiers
- Lifestyle costs that pressure cash reserves

Failure should produce a clear post-run summary: what killed the run, what the player learned, and what permanent progress was earned.

## Testing Strategy

### Simulation Tests

Automated tests should cover:

- Price generation determinism with fixed seeds
- Trade validation
- Share P/L
- Option settlement
- Expiry behavior
- Bankruptcy detection
- Career promotion gates
- Unlock persistence
- Event resolution

### Gameplay Balance Tests

Use seeded simulation runs to check:

- Expected run duration
- Bankruptcy frequency
- Promotion frequency
- Cash growth ranges
- Event severity distribution
- Whether early game decisions matter

### UI Tests

Browser tests should verify:

- The game loads to a playable screen
- The trading ticket can place a valid order
- Day advancement updates the market-week strip
- Friday expiry resolves positions
- Bankruptcy shows a post-run summary
- Room upgrades visually change the scene

### Playtest Checklist

Early playtests should answer:

- Did the player understand why they made or lost money?
- Did Friday expiry feel tense?
- Did the room/career progression feel rewarding?
- Did the player want to start another run after bankruptcy?
- Was trading depth exciting rather than confusing?

## Architecture Recommendation

Use a TypeScript browser-game app.

Recommended stack:

- Vite
- TypeScript
- Phaser for the room/playfield scene
- DOM/CSS UI for trading terminal and menus
- A small state store for simulation state
- Seeded random generation for market runs
- Local storage for alpha save data

Keep boundaries explicit:

- `simulation/` owns game rules and saveable state
- `market/` owns ticker generation, regimes, event decks, and prices
- `trading/` owns orders, positions, option settlement, and risk
- `career/` owns tier progression and unlocks
- `ui/` owns DOM trading surfaces
- `scene/` owns Phaser room and office visuals
- `content/` owns tickers, events, tiers, upgrades, and characters

## Open Design Decisions For Implementation Planning

These are decisions to make during implementation planning:

- Whether this game should live in the existing monorepo as `apps/trader-game` or in a separate repo
- Exact save format for alpha persistence
- Whether React should host the DOM UI or whether plain TypeScript DOM components are enough
- How detailed the first option pricing model should be
- How many character events should ship in the first alpha content pack

## Out Of Scope For Alpha

The alpha should not include:

- Live brokerage integration
- Real-money trading
- Real-time market data dependency
- Multiplayer
- Online leaderboards
- Full regulatory simulation
- Full 3D office traversal
- Real company tickers as the core market

## Success Criteria

The playable alpha succeeds if:

- A new player can complete a market week within a few minutes
- Friday expiry creates tension
- The player understands the connection between thesis, trades, events, and outcome
- Bankruptcy feels painful but replayable
- Career and room progression are visible
- A run can produce memorable stories
- The player wants one more run

