# Career Roguelite Trader First Playable Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first playable browser version: a complete Monday-Friday market week with fictional tickers, shares/calls/puts, a market shock, Friday expiry, bankruptcy checks, persistent unlocks, React trading UI, and a Phaser room scene.

**Architecture:** Game rules live in deterministic TypeScript simulation modules and never inside React components or Phaser scenes. React owns the trading terminal and game shell; Phaser owns the room/office scene and visual progression. Save data is serializable and stored in localStorage for the alpha.

**Tech Stack:** Vite, TypeScript, React, Phaser, Vitest, Playwright, CSS modules/plain CSS, localStorage.

---

## Scope Check

The design spec describes the full playable alpha. This plan builds the first playable vertical slice that proves the core loop:

- Bedroom Day Trader tier
- One full market week
- Fictional market generation
- Shares, calls, puts
- One Wednesday market shock
- Friday expiry
- Cash, P/L, reputation, XP
- Bankruptcy and post-run summary
- One persistent room/tool unlock
- React terminal plus Phaser room scene

Follow-up plans should expand career tiers, content volume, advanced options strategies, clients, boss weeks, and long-run balance.

## File Structure

Create these files:

- `package.json` - scripts and dependencies
- `index.html` - Vite entry document
- `tsconfig.json` - TypeScript app config
- `tsconfig.node.json` - TypeScript config for Vite config
- `vite.config.ts` - Vite, React, Vitest config
- `playwright.config.ts` - browser smoke test config
- `src/main.tsx` - React entry point
- `src/App.tsx` - game shell
- `src/styles.css` - global game styling
- `src/game/types.ts` - shared simulation types
- `src/game/createInitialState.ts` - new run and save creation
- `src/game/reducer.ts` - action reducer that coordinates simulation modules
- `src/game/selectors.ts` - derived UI values
- `src/simulation/rng.ts` - deterministic random generator
- `src/market/marketGenerator.ts` - ticker and price generation
- `src/market/marketGenerator.test.ts` - market determinism tests
- `src/trading/options.ts` - simplified option pricing and settlement
- `src/trading/tradingEngine.ts` - order validation and execution
- `src/trading/tradingEngine.test.ts` - trading tests
- `src/week/weekEngine.ts` - day advancement, event shock, expiry
- `src/week/weekEngine.test.ts` - week-loop tests
- `src/career/careerEngine.ts` - reputation, XP, bankruptcy, unlocks
- `src/career/careerEngine.test.ts` - career tests
- `src/content/tickers.ts` - fictional ticker content
- `src/content/events.ts` - first event cards
- `src/content/upgrades.ts` - first room/tool upgrades
- `src/save/saveGame.ts` - localStorage persistence
- `src/ui/Hud.tsx` - top HUD
- `src/ui/MarketWeekStrip.tsx` - Monday-Friday timeline
- `src/ui/TradingTerminal.tsx` - watchlist, positions, trade ticket
- `src/ui/PostRunSummary.tsx` - bankruptcy/week summary overlay
- `src/scene/RoomScene.ts` - Phaser room scene
- `src/scene/RoomCanvas.tsx` - React bridge mounting Phaser
- `tests/first-playable.spec.ts` - Playwright smoke test

---

### Task 1: Scaffold The Browser Game App

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `playwright.config.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "career-roguelite-trader",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "preview": "vite preview --host 127.0.0.1"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "phaser": "^3.90.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "vite": "^6.0.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.52.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.8.0",
    "vitest": "^3.1.0"
  }
}
```

- [ ] **Step 2: Create Vite and TypeScript config files**

`index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Career Roguelite Trader</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src", "tests", "vite.config.ts", "playwright.config.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

`tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "playwright.config.ts"]
}
```

`vite.config.ts`:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    css: true
  }
});
```

`playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
```

- [ ] **Step 3: Create the initial React shell**

`src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

`src/App.tsx`:

```tsx
export function App() {
  return (
    <main className="game-shell">
      <section className="room-panel" aria-label="Room scene">
        <div className="scene-title">Bedroom Day Trader</div>
      </section>
      <section className="terminal-panel" aria-label="Trading terminal">
        <h1>Career Roguelite Trader</h1>
        <p>First playable build in progress.</p>
      </section>
    </main>
  );
}
```

`src/styles.css`:

```css
:root {
  color-scheme: dark;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #050812;
  color: #e5e7eb;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background: #050812;
}

button,
input,
select {
  font: inherit;
}

.game-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(360px, 0.75fr);
  gap: 16px;
  padding: 16px;
}

.room-panel,
.terminal-panel {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.72);
  min-height: calc(100vh - 32px);
}

.terminal-panel {
  padding: 20px;
}

.scene-title {
  min-height: 100%;
  display: grid;
  place-items: center;
  color: #94a3b8;
}

@media (max-width: 920px) {
  .game-shell {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Install dependencies**

Run:

```powershell
npm install
```

Expected: `package-lock.json` is created and npm exits with code 0.

- [ ] **Step 5: Verify scaffold**

Run:

```powershell
npm run build
```

Expected: TypeScript and Vite build complete with exit code 0.

---

### Task 2: Add Domain Types And Deterministic RNG

**Files:**
- Create: `src/game/types.ts`
- Create: `src/simulation/rng.ts`
- Create: `src/simulation/rng.test.ts`

- [ ] **Step 1: Write RNG tests**

`src/simulation/rng.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createRng } from './rng';

describe('createRng', () => {
  it('returns the same sequence for the same seed', () => {
    const a = createRng(12345);
    const b = createRng(12345);

    expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()]);
  });

  it('can pick deterministic array items', () => {
    const rng = createRng(7);

    expect(rng.pick(['alpha', 'beta', 'gamma'])).toBe('alpha');
  });
});
```

- [ ] **Step 2: Run the failing test**

Run:

```powershell
npm test -- src/simulation/rng.test.ts
```

Expected: FAIL because `src/simulation/rng.ts` does not exist.

- [ ] **Step 3: Implement shared domain types**

`src/game/types.ts`:

```ts
export type WeekDay = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';
export type Sector = 'TECH' | 'ENERGY' | 'BIOTECH' | 'HOUSING' | 'DEFENSE' | 'CONSUMER';
export type MarketRegime = 'CALM' | 'EARNINGS_STORM' | 'FED_WEEK' | 'CRASH_WATCH' | 'MELT_UP' | 'MEME_MANIA';
export type CareerTier = 'BEDROOM_DAY_TRADER' | 'PROP_DESK_ROOKIE' | 'STOCK_BROKER' | 'FUND_MANAGER' | 'HEDGE_FUND_FOUNDER';
export type InstrumentType = 'SHARE' | 'CALL' | 'PUT';

export interface TickerDefinition {
  symbol: string;
  name: string;
  sector: Sector;
  basePrice: number;
  volatility: number;
  quality: number;
}

export interface PricePoint {
  day: WeekDay;
  price: number;
}

export interface MarketTicker {
  definition: TickerDefinition;
  prices: PricePoint[];
  signal: string;
}

export interface OptionContract {
  id: string;
  symbol: string;
  type: 'CALL' | 'PUT';
  strike: number;
  premium: number;
  quantity: number;
  openedDay: WeekDay;
  expiresDay: 'FRI';
}

export interface SharePosition {
  symbol: string;
  quantity: number;
  averagePrice: number;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  sector?: Sector;
  symbol?: string;
  priceImpact: number;
  volatilityImpact: number;
  reputationImpact: number;
}

export interface UnlockState {
  betterNewsFeed: boolean;
  secondMonitor: boolean;
}

export interface RunState {
  seed: number;
  week: number;
  day: WeekDay;
  tier: CareerTier;
  cash: number;
  reputation: number;
  xp: number;
  marketRegime: MarketRegime;
  tickers: MarketTicker[];
  sharePositions: SharePosition[];
  optionPositions: OptionContract[];
  activeEvent?: GameEvent;
  isBankrupt: boolean;
  weekLog: string[];
}

export interface SaveState {
  unlocks: UnlockState;
  bestNetWorth: number;
  runsCompleted: number;
}

export interface GameState {
  run: RunState;
  save: SaveState;
}
```

- [ ] **Step 4: Implement RNG**

`src/simulation/rng.ts`:

```ts
export interface Rng {
  next(): number;
  int(minInclusive: number, maxInclusive: number): number;
  float(minInclusive: number, maxExclusive: number): number;
  pick<T>(items: readonly T[]): T;
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  function next() {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    next,
    int(minInclusive, maxInclusive) {
      return Math.floor(next() * (maxInclusive - minInclusive + 1)) + minInclusive;
    },
    float(minInclusive, maxExclusive) {
      return next() * (maxExclusive - minInclusive) + minInclusive;
    },
    pick(items) {
      if (items.length === 0) {
        throw new Error('Cannot pick from an empty array.');
      }
      return items[Math.floor(next() * items.length)];
    }
  };
}
```

- [ ] **Step 5: Verify RNG tests pass**

Run:

```powershell
npm test -- src/simulation/rng.test.ts
```

Expected: PASS.

---

### Task 3: Add Content And Market Generation

**Files:**
- Create: `src/content/tickers.ts`
- Create: `src/content/events.ts`
- Create: `src/market/marketGenerator.ts`
- Create: `src/market/marketGenerator.test.ts`

- [ ] **Step 1: Write market generator tests**

`src/market/marketGenerator.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { generateMarketWeek } from './marketGenerator';

describe('generateMarketWeek', () => {
  it('creates deterministic tickers for a seed', () => {
    const a = generateMarketWeek(42);
    const b = generateMarketWeek(42);

    expect(a).toEqual(b);
    expect(a.tickers).toHaveLength(8);
    expect(a.tickers[0].prices).toHaveLength(5);
  });

  it('creates positive prices for every day', () => {
    const week = generateMarketWeek(99);

    for (const ticker of week.tickers) {
      for (const point of ticker.prices) {
        expect(point.price).toBeGreaterThan(0);
      }
    }
  });
});
```

- [ ] **Step 2: Run the failing test**

Run:

```powershell
npm test -- src/market/marketGenerator.test.ts
```

Expected: FAIL because market content and generator do not exist.

- [ ] **Step 3: Create ticker content**

`src/content/tickers.ts`:

```ts
import type { TickerDefinition } from '../game/types';

export const tickerDefinitions: TickerDefinition[] = [
  { symbol: 'NVRA', name: 'Novara Robotics', sector: 'TECH', basePrice: 48, volatility: 0.08, quality: 0.72 },
  { symbol: 'FIZZ', name: 'Fizzline Energy', sector: 'ENERGY', basePrice: 31, volatility: 0.13, quality: 0.41 },
  { symbol: 'BRIK', name: 'Brikwell Homes', sector: 'HOUSING', basePrice: 22, volatility: 0.06, quality: 0.55 },
  { symbol: 'ORBX', name: 'Orbix Defense', sector: 'DEFENSE', basePrice: 74, volatility: 0.05, quality: 0.68 },
  { symbol: 'PLSM', name: 'PulseMint Bio', sector: 'BIOTECH', basePrice: 18, volatility: 0.16, quality: 0.38 },
  { symbol: 'SNAX', name: 'SnackForge Brands', sector: 'CONSUMER', basePrice: 39, volatility: 0.07, quality: 0.61 },
  { symbol: 'QBIT', name: 'Qubit Harbor', sector: 'TECH', basePrice: 57, volatility: 0.11, quality: 0.49 },
  { symbol: 'DRON', name: 'AeroDrone Systems', sector: 'DEFENSE', basePrice: 63, volatility: 0.09, quality: 0.58 },
  { symbol: 'GLMR', name: 'Glimmer Retail', sector: 'CONSUMER', basePrice: 27, volatility: 0.1, quality: 0.46 },
  { symbol: 'VACC', name: 'Vactera Labs', sector: 'BIOTECH', basePrice: 44, volatility: 0.14, quality: 0.52 }
];
```

- [ ] **Step 4: Create event content**

`src/content/events.ts`:

```ts
import type { GameEvent } from '../game/types';

export const eventDeck: GameEvent[] = [
  {
    id: 'fed-hot-mic',
    title: 'Fed Hot Mic',
    description: 'A leaked comment hints rates may stay higher than expected.',
    priceImpact: -0.07,
    volatilityImpact: 0.12,
    reputationImpact: 0
  },
  {
    id: 'meme-squeeze',
    title: 'Message Board Squeeze',
    description: 'Retail traders swarm the most-shorted ticker on your watchlist.',
    priceImpact: 0.18,
    volatilityImpact: 0.2,
    reputationImpact: 1
  },
  {
    id: 'short-report',
    title: 'Short Report',
    description: 'A famous short seller publishes a brutal thread before lunch.',
    priceImpact: -0.16,
    volatilityImpact: 0.16,
    reputationImpact: -1
  },
  {
    id: 'surprise-contract',
    title: 'Surprise Contract',
    description: 'A defense name wins a contract nobody priced in.',
    sector: 'DEFENSE',
    priceImpact: 0.11,
    volatilityImpact: 0.08,
    reputationImpact: 1
  }
];
```

- [ ] **Step 5: Implement market generator**

`src/market/marketGenerator.ts`:

```ts
import type { MarketRegime, MarketTicker, WeekDay } from '../game/types';
import { tickerDefinitions } from '../content/tickers';
import { createRng } from '../simulation/rng';

const weekDays: WeekDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const regimes: MarketRegime[] = ['CALM', 'EARNINGS_STORM', 'FED_WEEK', 'CRASH_WATCH', 'MELT_UP', 'MEME_MANIA'];

const regimeBias: Record<MarketRegime, number> = {
  CALM: 0.002,
  EARNINGS_STORM: 0.006,
  FED_WEEK: -0.002,
  CRASH_WATCH: -0.014,
  MELT_UP: 0.018,
  MEME_MANIA: 0.011
};

export interface GeneratedMarketWeek {
  regime: MarketRegime;
  tickers: MarketTicker[];
}

export function generateMarketWeek(seed: number): GeneratedMarketWeek {
  const rng = createRng(seed);
  const regime = rng.pick(regimes);
  const shuffled = [...tickerDefinitions].sort(() => rng.next() - 0.5);
  const selected = shuffled.slice(0, 8);

  return {
    regime,
    tickers: selected.map((definition) => {
      let price = definition.basePrice;
      const prices = weekDays.map((day) => {
        const drift = regimeBias[regime] + (definition.quality - 0.5) * 0.01;
        const noise = rng.float(-definition.volatility, definition.volatility);
        price = Math.max(1, price * (1 + drift + noise));
        return { day, price: roundMoney(price) };
      });

      return {
        definition,
        prices,
        signal: createSignal(definition.quality, regime)
      };
    })
  };
}

function createSignal(quality: number, regime: MarketRegime) {
  if (quality > 0.65) return `Analysts quietly like this name during ${regime.toLowerCase().replaceAll('_', ' ')}.`;
  if (quality < 0.45) return `The tape is jumpy and the signal quality is poor.`;
  return `Mixed signals: price action matters more than headlines.`;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
```

- [ ] **Step 6: Verify market tests pass**

Run:

```powershell
npm test -- src/market/marketGenerator.test.ts
```

Expected: PASS.

---

### Task 4: Implement Trading And Option Settlement

**Files:**
- Create: `src/trading/options.ts`
- Create: `src/trading/tradingEngine.ts`
- Create: `src/trading/tradingEngine.test.ts`

- [ ] **Step 1: Write trading tests**

`src/trading/tradingEngine.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { RunState } from '../game/types';
import { buyCall, buyShares, settleOptions } from './tradingEngine';

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
  weekLog: []
};

describe('tradingEngine', () => {
  it('buys shares and reduces cash', () => {
    const run = buyShares(baseRun, 'NVRA', 10, 50);

    expect(run.cash).toBe(4500);
    expect(run.sharePositions).toEqual([{ symbol: 'NVRA', quantity: 10, averagePrice: 50 }]);
  });

  it('buys a call option using premium times quantity', () => {
    const run = buyCall(baseRun, 'NVRA', 55, 2, 4.5);

    expect(run.cash).toBe(4991);
    expect(run.optionPositions[0]).toMatchObject({ symbol: 'NVRA', type: 'CALL', strike: 55, quantity: 2 });
  });

  it('settles calls at expiry', () => {
    const withCall = buyCall(baseRun, 'NVRA', 55, 1, 3);
    const settled = settleOptions(withCall, { NVRA: 62 });

    expect(settled.cash).toBe(5004);
    expect(settled.optionPositions).toHaveLength(0);
    expect(settled.weekLog.at(-1)).toContain('expired in the money');
  });
});
```

- [ ] **Step 2: Run the failing test**

Run:

```powershell
npm test -- src/trading/tradingEngine.test.ts
```

Expected: FAIL because trading modules do not exist.

- [ ] **Step 3: Implement option pricing helpers**

`src/trading/options.ts`:

```ts
export function estimatePremium(currentPrice: number, strike: number, volatility: number, type: 'CALL' | 'PUT') {
  const intrinsic = type === 'CALL'
    ? Math.max(0, currentPrice - strike)
    : Math.max(0, strike - currentPrice);
  const distance = Math.abs(currentPrice - strike) / currentPrice;
  const timeValue = currentPrice * Math.max(0.02, volatility) * Math.max(0.35, 1 - distance);
  return roundMoney(Math.max(0.5, intrinsic + timeValue));
}

export function settleOptionValue(type: 'CALL' | 'PUT', strike: number, finalPrice: number, quantity: number) {
  const value = type === 'CALL'
    ? Math.max(0, finalPrice - strike)
    : Math.max(0, strike - finalPrice);
  return roundMoney(value * quantity);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
```

- [ ] **Step 4: Implement trading engine**

`src/trading/tradingEngine.ts`:

```ts
import type { OptionContract, RunState } from '../game/types';
import { settleOptionValue } from './options';

export function buyShares(run: RunState, symbol: string, quantity: number, price: number): RunState {
  const cost = roundMoney(quantity * price);
  if (cost > run.cash) return addLog(run, `Not enough cash to buy ${quantity} ${symbol} shares.`);

  const existing = run.sharePositions.find((position) => position.symbol === symbol);
  const sharePositions = existing
    ? run.sharePositions.map((position) => {
        if (position.symbol !== symbol) return position;
        const totalQuantity = position.quantity + quantity;
        const totalCost = position.averagePrice * position.quantity + cost;
        return { ...position, quantity: totalQuantity, averagePrice: roundMoney(totalCost / totalQuantity) };
      })
    : [...run.sharePositions, { symbol, quantity, averagePrice: price }];

  return addLog({ ...run, cash: roundMoney(run.cash - cost), sharePositions }, `Bought ${quantity} ${symbol} shares.`);
}

export function buyCall(run: RunState, symbol: string, strike: number, quantity: number, premium: number): RunState {
  return buyOption(run, symbol, 'CALL', strike, quantity, premium);
}

export function buyPut(run: RunState, symbol: string, strike: number, quantity: number, premium: number): RunState {
  return buyOption(run, symbol, 'PUT', strike, quantity, premium);
}

export function settleOptions(run: RunState, finalPrices: Record<string, number>): RunState {
  let cash = run.cash;
  const logs = [...run.weekLog];

  for (const option of run.optionPositions) {
    const finalPrice = finalPrices[option.symbol];
    if (finalPrice === undefined) continue;
    const payout = settleOptionValue(option.type, option.strike, finalPrice, option.quantity);
    cash = roundMoney(cash + payout);
    logs.push(`${option.symbol} ${option.type} ${option.strike} expired ${payout > 0 ? 'in the money' : 'worthless'} for $${payout}.`);
  }

  return { ...run, cash, optionPositions: [], weekLog: logs };
}

function buyOption(run: RunState, symbol: string, type: 'CALL' | 'PUT', strike: number, quantity: number, premium: number): RunState {
  const cost = roundMoney(quantity * premium);
  if (cost > run.cash) return addLog(run, `Not enough cash to buy ${quantity} ${symbol} ${type}.`);

  const contract: OptionContract = {
    id: `${run.week}-${run.day}-${symbol}-${type}-${strike}-${run.optionPositions.length}`,
    symbol,
    type,
    strike,
    premium,
    quantity,
    openedDay: run.day,
    expiresDay: 'FRI'
  };

  return addLog(
    { ...run, cash: roundMoney(run.cash - cost), optionPositions: [...run.optionPositions, contract] },
    `Bought ${quantity} ${symbol} ${type} ${strike}.`
  );
}

function addLog(run: RunState, message: string): RunState {
  return { ...run, weekLog: [...run.weekLog, message] };
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
```

- [ ] **Step 5: Verify trading tests pass**

Run:

```powershell
npm test -- src/trading/tradingEngine.test.ts
```

Expected: PASS.

---

### Task 5: Implement Week, Career, Save, And App State

**Files:**
- Create: `src/career/careerEngine.ts`
- Create: `src/career/careerEngine.test.ts`
- Create: `src/week/weekEngine.ts`
- Create: `src/week/weekEngine.test.ts`
- Create: `src/content/upgrades.ts`
- Create: `src/game/createInitialState.ts`
- Create: `src/game/reducer.ts`
- Create: `src/game/selectors.ts`
- Create: `src/save/saveGame.ts`

- [ ] **Step 1: Write career and week tests**

`src/career/careerEngine.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { applyWeekOutcome, checkBankruptcy } from './careerEngine';

describe('careerEngine', () => {
  it('marks a run bankrupt when cash falls below zero', () => {
    expect(checkBankruptcy({ cash: -1, isBankrupt: false })).toMatchObject({ isBankrupt: true });
  });

  it('awards XP and reputation for profitable weeks', () => {
    expect(applyWeekOutcome({ cashDelta: 1200, reputation: 40, xp: 0 })).toEqual({ reputation: 43, xp: 2 });
  });
});
```

`src/week/weekEngine.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { RunState } from '../game/types';
import { advanceDay } from './weekEngine';

const run: RunState = {
  seed: 3,
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
  weekLog: []
};

describe('advanceDay', () => {
  it('moves through the market week', () => {
    expect(advanceDay(run).day).toBe('TUE');
    expect(advanceDay({ ...run, day: 'TUE' }).day).toBe('WED');
  });

  it('starts a new week after Friday', () => {
    const next = advanceDay({ ...run, day: 'FRI', week: 1 });

    expect(next.day).toBe('MON');
    expect(next.week).toBe(2);
  });
});
```

- [ ] **Step 2: Run failing tests**

Run:

```powershell
npm test -- src/career/careerEngine.test.ts src/week/weekEngine.test.ts
```

Expected: FAIL because career and week modules do not exist.

- [ ] **Step 3: Implement career engine**

`src/career/careerEngine.ts`:

```ts
export function checkBankruptcy<T extends { cash: number; isBankrupt: boolean }>(run: T): T {
  return run.cash < 0 ? { ...run, isBankrupt: true } : run;
}

export function applyWeekOutcome(input: { cashDelta: number; reputation: number; xp: number }) {
  if (input.cashDelta > 0) {
    return { reputation: Math.min(100, input.reputation + 3), xp: input.xp + 2 };
  }

  if (input.cashDelta < -1000) {
    return { reputation: Math.max(0, input.reputation - 4), xp: input.xp + 1 };
  }

  return { reputation: input.reputation, xp: input.xp + 1 };
}
```

- [ ] **Step 4: Implement week engine**

`src/week/weekEngine.ts`:

```ts
import type { RunState, WeekDay } from '../game/types';

const dayOrder: WeekDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

export function advanceDay(run: RunState): RunState {
  const currentIndex = dayOrder.indexOf(run.day);
  if (currentIndex < dayOrder.length - 1) {
    return { ...run, day: dayOrder[currentIndex + 1] };
  }

  return {
    ...run,
    week: run.week + 1,
    day: 'MON',
    weekLog: [`Week ${run.week + 1} begins.`]
  };
}
```

- [ ] **Step 5: Create game state and save modules**

`src/content/upgrades.ts`:

```ts
export const roomUpgrades = [
  {
    id: 'second-monitor',
    label: 'Second Monitor',
    description: 'Shows one extra signal on the trading terminal.',
    cost: 750
  },
  {
    id: 'better-news-feed',
    label: 'Better News Feed',
    description: 'Improves event descriptions before the Wednesday shock.',
    cost: 1200
  }
] as const;
```

`src/game/createInitialState.ts`:

```ts
import type { GameState, SaveState } from './types';
import { generateMarketWeek } from '../market/marketGenerator';

export function createInitialSave(): SaveState {
  return {
    unlocks: {
      betterNewsFeed: false,
      secondMonitor: false
    },
    bestNetWorth: 0,
    runsCompleted: 0
  };
}

export function createInitialGameState(seed = Date.now(), save = createInitialSave()): GameState {
  const market = generateMarketWeek(seed);

  return {
    save,
    run: {
      seed,
      week: 1,
      day: 'MON',
      tier: 'BEDROOM_DAY_TRADER',
      cash: 5000,
      reputation: 40,
      xp: 0,
      marketRegime: market.regime,
      tickers: market.tickers,
      sharePositions: [],
      optionPositions: [],
      isBankrupt: false,
      weekLog: ['You boot up your battered trading rig.']
    }
  };
}
```

`src/save/saveGame.ts`:

```ts
import type { SaveState } from '../game/types';
import { createInitialSave } from '../game/createInitialState';

const saveKey = 'career-roguelite-trader-save-v1';

export function loadSave(): SaveState {
  const raw = localStorage.getItem(saveKey);
  if (!raw) return createInitialSave();

  try {
    return { ...createInitialSave(), ...JSON.parse(raw) } as SaveState;
  } catch {
    return createInitialSave();
  }
}

export function storeSave(save: SaveState) {
  localStorage.setItem(saveKey, JSON.stringify(save));
}
```

`src/game/reducer.ts`:

```ts
import type { GameState } from './types';
import { advanceDay } from '../week/weekEngine';
import { buyCall, buyPut, buyShares, settleOptions } from '../trading/tradingEngine';

export type GameAction =
  | { type: 'BUY_SHARES'; symbol: string; quantity: number; price: number }
  | { type: 'BUY_CALL'; symbol: string; strike: number; quantity: number; premium: number }
  | { type: 'BUY_PUT'; symbol: string; strike: number; quantity: number; premium: number }
  | { type: 'ADVANCE_DAY' };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'BUY_SHARES':
      return { ...state, run: buyShares(state.run, action.symbol, action.quantity, action.price) };
    case 'BUY_CALL':
      return { ...state, run: buyCall(state.run, action.symbol, action.strike, action.quantity, action.premium) };
    case 'BUY_PUT':
      return { ...state, run: buyPut(state.run, action.symbol, action.strike, action.quantity, action.premium) };
    case 'ADVANCE_DAY': {
      if (state.run.day !== 'FRI') return { ...state, run: advanceDay(state.run) };
      const finalPrices = Object.fromEntries(state.run.tickers.map((ticker) => [ticker.definition.symbol, ticker.prices.at(-1)?.price ?? ticker.definition.basePrice]));
      return { ...state, run: advanceDay(settleOptions(state.run, finalPrices)) };
    }
  }
}
```

`src/game/selectors.ts`:

```ts
import type { RunState } from './types';

export function getNetWorth(run: RunState) {
  const shareValue = run.sharePositions.reduce((total, position) => {
    const ticker = run.tickers.find((item) => item.definition.symbol === position.symbol);
    const price = ticker?.prices.find((point) => point.day === run.day)?.price ?? position.averagePrice;
    return total + position.quantity * price;
  }, 0);

  return Math.round((run.cash + shareValue) * 100) / 100;
}

export function getCurrentPrice(run: RunState, symbol: string) {
  const ticker = run.tickers.find((item) => item.definition.symbol === symbol);
  return ticker?.prices.find((point) => point.day === run.day)?.price ?? ticker?.definition.basePrice ?? 0;
}
```

- [ ] **Step 6: Verify career and week tests pass**

Run:

```powershell
npm test -- src/career/careerEngine.test.ts src/week/weekEngine.test.ts
```

Expected: PASS.

---

### Task 6: Build React Game UI

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Create: `src/ui/Hud.tsx`
- Create: `src/ui/MarketWeekStrip.tsx`
- Create: `src/ui/TradingTerminal.tsx`
- Create: `src/ui/PostRunSummary.tsx`

- [ ] **Step 1: Create HUD and week strip components**

`src/ui/Hud.tsx`:

```tsx
import type { RunState } from '../game/types';
import { getNetWorth } from '../game/selectors';

export function Hud({ run }: { run: RunState }) {
  return (
    <header className="hud" aria-label="Run status">
      <div><strong>${Math.round(run.cash).toLocaleString()}</strong><span>Cash</span></div>
      <div><strong>${Math.round(getNetWorth(run)).toLocaleString()}</strong><span>Net worth</span></div>
      <div><strong>{run.reputation}</strong><span>Reputation</span></div>
      <div><strong>{run.xp}</strong><span>XP</span></div>
      <div><strong>{run.marketRegime.replaceAll('_', ' ')}</strong><span>Regime</span></div>
    </header>
  );
}
```

`src/ui/MarketWeekStrip.tsx`:

```tsx
import type { WeekDay } from '../game/types';

const days: WeekDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

export function MarketWeekStrip({ currentDay, week }: { currentDay: WeekDay; week: number }) {
  return (
    <section className="week-strip" aria-label="Market week">
      <h2>Week {week}</h2>
      <div className="day-track">
        {days.map((day) => (
          <div className={day === currentDay ? 'day-card active' : 'day-card'} key={day}>
            {day}
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create terminal and summary components**

`src/ui/TradingTerminal.tsx`:

```tsx
import { useMemo, useState } from 'react';
import type { GameAction } from '../game/reducer';
import type { RunState } from '../game/types';
import { getCurrentPrice } from '../game/selectors';
import { estimatePremium } from '../trading/options';

export function TradingTerminal({ run, dispatch }: { run: RunState; dispatch: (action: GameAction) => void }) {
  const [symbol, setSymbol] = useState(run.tickers[0]?.definition.symbol ?? '');
  const currentPrice = getCurrentPrice(run, symbol);
  const ticker = run.tickers.find((item) => item.definition.symbol === symbol);
  const strike = Math.round(currentPrice * 1.05);
  const callPremium = useMemo(() => estimatePremium(currentPrice, strike, ticker?.definition.volatility ?? 0.1, 'CALL'), [currentPrice, strike, ticker]);
  const putPremium = useMemo(() => estimatePremium(currentPrice, Math.round(currentPrice * 0.95), ticker?.definition.volatility ?? 0.1, 'PUT'), [currentPrice, ticker]);

  return (
    <section className="terminal" aria-label="Trading terminal">
      <div className="terminal-header">
        <h1>Trading Terminal</h1>
        <button type="button" onClick={() => dispatch({ type: 'ADVANCE_DAY' })}>Advance Day</button>
      </div>

      <div className="watchlist">
        {run.tickers.map((item) => (
          <button className={item.definition.symbol === symbol ? 'ticker selected' : 'ticker'} key={item.definition.symbol} type="button" onClick={() => setSymbol(item.definition.symbol)}>
            <span>{item.definition.symbol}</span>
            <strong>${getCurrentPrice(run, item.definition.symbol).toFixed(2)}</strong>
          </button>
        ))}
      </div>

      <article className="signal-card">
        <h2>{ticker?.definition.name ?? symbol}</h2>
        <p>{ticker?.signal}</p>
      </article>

      <div className="trade-grid">
        <button type="button" onClick={() => dispatch({ type: 'BUY_SHARES', symbol, quantity: 10, price: currentPrice })}>Buy 10 Shares</button>
        <button type="button" onClick={() => dispatch({ type: 'BUY_CALL', symbol, strike, quantity: 1, premium: callPremium })}>Buy Call ${strike}</button>
        <button type="button" onClick={() => dispatch({ type: 'BUY_PUT', symbol, strike: Math.round(currentPrice * 0.95), quantity: 1, premium: putPremium })}>Buy Put</button>
      </div>

      <section className="positions">
        <h2>Positions</h2>
        {run.sharePositions.map((position) => <p key={position.symbol}>{position.quantity} {position.symbol} shares @ ${position.averagePrice}</p>)}
        {run.optionPositions.map((option) => <p key={option.id}>{option.quantity} {option.symbol} {option.type} {option.strike}</p>)}
      </section>

      <section className="log">
        <h2>Week Log</h2>
        {run.weekLog.slice(-6).map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}
      </section>
    </section>
  );
}
```

`src/ui/PostRunSummary.tsx`:

```tsx
import type { RunState } from '../game/types';

export function PostRunSummary({ run, onRestart }: { run: RunState; onRestart: () => void }) {
  if (!run.isBankrupt) return null;

  return (
    <div className="summary-backdrop" role="dialog" aria-modal="true" aria-label="Post-run summary">
      <section className="summary-panel">
        <h2>Run Liquidated</h2>
        <p>You ran out of cash in week {run.week}. Reputation carries scars, but your market journal survives.</p>
        <button type="button" onClick={onRestart}>Start New Run</button>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Wire components into `App.tsx`**

`src/App.tsx`:

```tsx
import { useReducer } from 'react';
import { createInitialGameState } from './game/createInitialState';
import { gameReducer } from './game/reducer';
import { Hud } from './ui/Hud';
import { MarketWeekStrip } from './ui/MarketWeekStrip';
import { TradingTerminal } from './ui/TradingTerminal';
import { PostRunSummary } from './ui/PostRunSummary';

export function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createInitialGameState(20260508));

  return (
    <main className="game-shell">
      <section className="room-panel" aria-label="Room scene">
        <div className="scene-title">Bedroom Day Trader</div>
      </section>
      <section className="terminal-panel" aria-label="Trading terminal">
        <Hud run={state.run} />
        <MarketWeekStrip currentDay={state.run.day} week={state.run.week} />
        <TradingTerminal run={state.run} dispatch={dispatch} />
      </section>
      <PostRunSummary run={state.run} onRestart={() => window.location.reload()} />
    </main>
  );
}
```

- [ ] **Step 4: Extend CSS for game UI**

Append to `src/styles.css`:

```css
.hud,
.day-track,
.watchlist,
.trade-grid {
  display: grid;
  gap: 10px;
}

.hud {
  grid-template-columns: repeat(5, 1fr);
  margin-bottom: 14px;
}

.hud div,
.day-card,
.signal-card,
.positions,
.log,
.ticker {
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.52);
  padding: 12px;
}

.hud strong {
  display: block;
  color: #f8fafc;
}

.hud span {
  display: block;
  color: #94a3b8;
  font-size: 12px;
}

.week-strip {
  margin-bottom: 14px;
}

.day-track {
  grid-template-columns: repeat(5, 1fr);
}

.day-card.active,
.ticker.selected {
  border-color: #6ee7b7;
  box-shadow: inset 0 0 0 1px rgba(110, 231, 183, 0.26);
}

.terminal {
  display: grid;
  gap: 14px;
}

.terminal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.watchlist {
  grid-template-columns: repeat(2, 1fr);
}

.ticker,
.trade-grid button,
.terminal-header button,
.summary-panel button {
  color: #f8fafc;
  cursor: pointer;
}

.ticker {
  text-align: left;
}

.ticker strong {
  float: right;
}

.trade-grid {
  grid-template-columns: repeat(3, 1fr);
}

.trade-grid button,
.terminal-header button,
.summary-panel button {
  border: 0;
  border-radius: 8px;
  background: #16a34a;
  padding: 11px 12px;
  font-weight: 700;
}

.summary-backdrop {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(2, 6, 23, 0.78);
}

.summary-panel {
  width: min(420px, calc(100vw - 32px));
  border: 1px solid rgba(248, 113, 113, 0.35);
  border-radius: 8px;
  background: #0f172a;
  padding: 24px;
}
```

- [ ] **Step 5: Verify UI build**

Run:

```powershell
npm run build
```

Expected: PASS.

---

### Task 7: Replace Static Room Card With Phaser Room Scene

**Files:**
- Create: `src/scene/RoomScene.ts`
- Create: `src/scene/RoomCanvas.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create Phaser scene**

`src/scene/RoomScene.ts`:

```ts
import Phaser from 'phaser';
import type { RunState } from '../game/types';

export class RoomScene extends Phaser.Scene {
  private run?: RunState;

  constructor() {
    super('RoomScene');
  }

  init(data: { run: RunState }) {
    this.run = data.run;
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.add.rectangle(width / 2, height / 2, width, height, 0x111827);
    this.add.rectangle(width - 110, 90, 120, 150, 0x2563eb).setAlpha(0.7);
    this.add.rectangle(width / 2, height - 120, width - 90, 34, 0x334155);
    this.add.rectangle(width / 2 - 120, height - 190, 170, 110, 0x020617).setStrokeStyle(4, 0x0f172a);
    this.add.rectangle(width / 2 + 80, height - 190, 170, 110, 0x020617).setStrokeStyle(4, 0x0f172a);
    this.add.text(28, 24, 'Bedroom Day Trader', { fontFamily: 'Arial', fontSize: '18px', color: '#e5e7eb' });
    this.add.text(28, 52, `Week ${this.run?.week ?? 1} / ${this.run?.day ?? 'MON'}`, { fontFamily: 'Arial', fontSize: '14px', color: '#94a3b8' });
  }
}
```

- [ ] **Step 2: Create React Phaser bridge**

`src/scene/RoomCanvas.tsx`:

```tsx
import Phaser from 'phaser';
import { useEffect, useRef } from 'react';
import type { RunState } from '../game/types';
import { RoomScene } from './RoomScene';

export function RoomCanvas({ run }: { run: RunState }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!hostRef.current || gameRef.current) return;

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostRef.current,
      width: 960,
      height: 640,
      backgroundColor: '#050812',
      scene: [RoomScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    });

    gameRef.current.scene.start('RoomScene', { run });

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    const scene = gameRef.current?.scene.getScene('RoomScene');
    if (scene) {
      gameRef.current?.scene.stop('RoomScene');
      gameRef.current?.scene.start('RoomScene', { run });
    }
  }, [run.week, run.day, run.cash, run.reputation]);

  return <div className="room-canvas" ref={hostRef} />;
}
```

- [ ] **Step 3: Use `RoomCanvas` in `App.tsx`**

Replace the static room section with:

```tsx
<section className="room-panel" aria-label="Room scene">
  <RoomCanvas run={state.run} />
</section>
```

Add import:

```ts
import { RoomCanvas } from './scene/RoomCanvas';
```

- [ ] **Step 4: Add room canvas CSS**

Append to `src/styles.css`:

```css
.room-canvas {
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 32px);
  overflow: hidden;
}

.room-canvas canvas {
  display: block;
}
```

- [ ] **Step 5: Verify Phaser build**

Run:

```powershell
npm run build
```

Expected: PASS.

---

### Task 8: Add First Browser Smoke Test

**Files:**
- Create: `tests/first-playable.spec.ts`

- [ ] **Step 1: Write smoke test**

`tests/first-playable.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('player can buy a call and advance through the week', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Trading Terminal' })).toBeVisible();
  await expect(page.getByLabel('Market week')).toContainText('MON');

  await page.getByRole('button', { name: /Buy Call/i }).click();
  await expect(page.getByText(/Bought 1 .* CALL/i)).toBeVisible();

  await page.getByRole('button', { name: 'Advance Day' }).click();
  await expect(page.getByLabel('Market week')).toContainText('TUE');

  await page.getByRole('button', { name: 'Advance Day' }).click();
  await page.getByRole('button', { name: 'Advance Day' }).click();
  await page.getByRole('button', { name: 'Advance Day' }).click();
  await page.getByRole('button', { name: 'Advance Day' }).click();

  await expect(page.getByText(/expired/i)).toBeVisible();
});
```

- [ ] **Step 2: Run Playwright test**

Run:

```powershell
npm run test:e2e
```

Expected: PASS. If Playwright browsers are missing, run `npx playwright install chromium`, then rerun `npm run test:e2e`.

---

### Task 9: Final Verification For First Playable

**Files:**
- Modify only if verification reveals a defect in files created above.

- [ ] **Step 1: Run all unit tests**

Run:

```powershell
npm test
```

Expected: all Vitest suites pass.

- [ ] **Step 2: Run production build**

Run:

```powershell
npm run build
```

Expected: TypeScript and Vite build pass.

- [ ] **Step 3: Run browser smoke test**

Run:

```powershell
npm run test:e2e
```

Expected: Playwright test passes.

- [ ] **Step 4: Start dev server for user playtest**

Run:

```powershell
npm run dev
```

Expected: Vite prints a local URL such as `http://127.0.0.1:5173/`.

---

## Plan Self-Review

Spec coverage in this plan:

- Market-week loop: Tasks 5, 6, 8
- Fictional tickers and regimes: Task 3
- Shares/calls/puts: Task 4
- Friday expiry: Tasks 4, 5, 8
- Bankruptcy and progression groundwork: Task 5
- Room/playfield scene: Task 7
- DOM terminal and HUD: Task 6
- Simulation tests: Tasks 2-5
- Browser test: Task 8

Known scope deferred to follow-up implementation plans:

- Five career tiers beyond the first tier
- Full 20-30 ticker content pack
- Full 30+ event deck
- Covered calls, spreads, straddles, stop losses, and margin
- Clients, bosses, rivals, mentor events, and media moments
- Balance simulation for 15-25 minute runs
- Polished art/audio asset pipeline
