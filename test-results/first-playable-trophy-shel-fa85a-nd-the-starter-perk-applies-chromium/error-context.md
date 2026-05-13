# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: first-playable.spec.ts >> trophy shelf >> shows persistent unlocks from prior runs and the starter perk applies
- Location: tests\first-playable.spec.ts:306:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.trophy-shelf').locator('.trophy-count')
Expected substring: "3/5"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('.trophy-shelf').locator('.trophy-count')

```

```yaml
- main:
  - region "Market tape":
    - text: Rogue Street
    - strong: Cash Velocity Desk
    - strong: FORT
    - text: $26.03
    - emphasis: +0.0%
    - strong: NVRA
    - text: $37.47
    - emphasis: +0.0%
    - strong: FIZZ
    - text: $19.19
    - emphasis: +0.0%
    - strong: CURR
    - text: $38.09
    - emphasis: +0.0%
    - strong: AURA
    - text: $49.09
    - emphasis: +0.0%
    - strong: GLMR
    - text: $40.79
    - emphasis: +0.0%
    - strong: CHIP
    - text: $72.73
    - emphasis: +0.0%
    - strong: LUME
    - text: $38.45
    - emphasis: +0.0%
    - text: CRASH WATCH
    - strong: W1 / MON
    - button "Mute audio": 🔊
    - button "Open settings": ⚙
  - region "Career status cockpit":
    - region "Room scene":
      - complementary "Trophy shelf":
        - text: Trophies 3/5
        - list:
          - listitem "Starter Mug — A chipped mug from your first weekend of trading. Never throw it out.": Starter Mug
          - listitem "Rookie Trophy — A small brass cup the desk gave you when you survived your first month.": Rookie Trophy
          - listitem "Brass Nameplate — BROKER stamped on brass. Clients see it. So do you.": Brass Nameplate
          - listitem "Locked — reach Fund Manager": "???"
          - listitem "Locked — reach Hedge Fund Founder": "???"
      - button "Open run journal": 📓 Journal
    - complementary "Career and week status":
      - strong: Bedroom Day Trader
      - text: Career
      - strong: $6,000
      - text: Cash
      - strong: $6,000
      - text: Net worth
      - strong: "43"
      - text: Reputation
      - strong: "0"
      - text: XP
      - strong: CALM
      - text: Mood
      - strong: CRASH WATCH
      - text: Regime
      - strong: $0
      - text: Best run
      - region "Market week":
        - heading "Week 1" [level=2]
        - text: Friday expiry is the judgment day.
        - strong: MON
        - text: Read
        - strong: TUE
        - text: Build
        - strong: WED
        - text: Shock
        - strong: THU
        - text: Risk
        - strong: FRI
        - text: Expiry
  - region "Trading terminal":
    - region "Trading terminal":
      - region "Market choices and log":
        - button "FORT +0.0% $26.03":
          - text: FORT
          - emphasis: +0.0%
          - strong: $26.03
        - button "NVRA +0.0% $37.47":
          - text: NVRA
          - emphasis: +0.0%
          - strong: $37.47
        - button "FIZZ +0.0% $19.19":
          - text: FIZZ
          - emphasis: +0.0%
          - strong: $19.19
        - button "CURR +0.0% $38.09":
          - text: CURR
          - emphasis: +0.0%
          - strong: $38.09
        - button "AURA +0.0% $49.09":
          - text: AURA
          - emphasis: +0.0%
          - strong: $49.09
        - button "GLMR +0.0% $40.79":
          - text: GLMR
          - emphasis: +0.0%
          - strong: $40.79
        - button "CHIP +0.0% $72.73":
          - text: CHIP
          - emphasis: +0.0%
          - strong: $72.73
        - button "LUME +0.0% $38.45":
          - text: LUME
          - emphasis: +0.0%
          - strong: $38.45
        - heading "Week Log" [level=2]
        - paragraph: You boot up your battered trading rig.
        - paragraph: "Broker reputation: +$1,000 and +3 starting rep."
      - region "Trading controls":
        - heading "Trading Terminal" [level=1]
        - paragraph: Read the market and choose a thesis.
        - button "Advance Day"
        - article:
          - strong: FORT
          - emphasis: TECH
          - text: BUY
          - emphasis: +14.6%
          - text: $26.03
          - emphasis: +0.0%
          - tablist "Stock intel tabs":
            - tab "Fundamentals" [selected]
            - tab "Technicals"
            - tab "News"
          - tabpanel: P/E Ratio 41 EPS $0.63 Market Cap MID Beta 1 Revenue Growth +24% Dividend Yield 0.0% Signal Quality 56% Volatility 10% Short Interest 21.9% 52W High $35.96 52W Low $21.74 Analyst Target $29.83
          - img "Candlestick chart with prior history, moving average, and support/resistance": SUP $22.12 RES $35.96 THIS WK MON TUE WED THU FRI 5-bar MA
        - region "Trade ticket":
          - heading "Trade Ticket" [level=2]
          - combobox "Strategy":
            - option "Single" [selected]
            - option "Call Spread"
            - option "Put Spread"
            - option "Straddle"
            - option "Covered Call"
          - radiogroup "Expiry day":
            - radio "TUE"
            - radio "THU"
            - radio "FRI" [checked]
          - text: Shares
          - spinbutton "Shares": "10"
          - text: Contracts
          - spinbutton "Contracts": "1"
          - text: Buying Power $6,000 Est. Share Cost $260 Call $27 $2.51 / $$251 Put $25 $2.50 / $$250 DTE 5d
          - button "Buy 10 Shares"
          - button "Sell 10 Shares"
          - button "Buy Call $27"
          - button "Buy Put $25"
          - button "Close Options"
          - text: Order
          - combobox "Order":
            - option "Stop Loss · Fund Manager" [disabled] [selected]
            - option "Limit Buy · Stock Broker" [disabled]
            - option "Limit Sell · Stock Broker" [disabled]
          - text: Trigger
          - spinbutton "Trigger"
          - button "Set STOP LOSS" [disabled]
      - region "Positions and progress":
        - heading "Positions" [level=2]
        - text: Net worth $6,000
        - paragraph: No positions yet. The market is waiting.
        - region "Weekly goals":
          - heading "Weekly Goals" [level=2]
          - text: Gate
          - strong: Reach $6,000 net worth
          - text: Cash plus marked shares $6,000 / $6,000
          - strong: Build street rep to 42
          - text: Protect the week and win cleanly 43 / 42
          - strong: Bank 4 XP lessons
          - text: Survive expiries and learn 0 / 4
        - 'heading "Next: PROP DESK ROOKIE" [level=2]'
        - paragraph: Bad bedroom. Buy tools, clear goals, climb after Friday expiry.
        - button "Second Monitor $750"
        - button "News Feed $1,200"
```

# Test source

```ts
  223 |       overflows,
  224 |       internalOverflows,
  225 |       tickerRows
  226 |     };
  227 |   });
  228 | 
  229 |   expect(metrics.hasHorizontalScroll).toBe(false);
  230 |   expect(metrics.hasVerticalScroll).toBe(false);
  231 |   expect(metrics.commandDeck?.width).toBeGreaterThan(1000);
  232 |   expect(metrics.room?.width).toBeGreaterThan(300);
  233 |   expect(metrics.statusDeck?.x).toBeGreaterThan((metrics.room?.x ?? 0) + (metrics.room?.width ?? 0));
  234 |   expect(metrics.hud?.bottom).toBeLessThanOrEqual(metrics.commandDeck?.bottom ?? 0);
  235 |   expect(metrics.weekStrip?.bottom).toBeLessThanOrEqual(metrics.commandDeck?.bottom ?? 0);
  236 |   expect(metrics.terminal?.width).toBeGreaterThan(1000);
  237 |   expect(metrics.terminal?.y).toBeGreaterThan((metrics.commandDeck?.y ?? 0) + (metrics.commandDeck?.height ?? 0));
  238 |   expect(metrics.marketColumn?.x).toBeLessThan(metrics.controlsColumn?.x ?? 0);
  239 |   expect(metrics.controlsColumn?.x).toBeLessThan(metrics.rightRail?.x ?? 0);
  240 |   // Right rail (positions + goals + upgrade) is narrower than the middle work area.
  241 |   expect(metrics.rightRail?.width ?? 0).toBeLessThan(metrics.controlsColumn?.width ?? 0);
  242 |   expect(metrics.watchlist?.x).toBe(metrics.log?.x);
  243 |   expect(Math.abs((metrics.watchlist?.width ?? 0) - (metrics.log?.width ?? 0))).toBeLessThanOrEqual(2);
  244 |   expect(metrics.log?.y).toBeGreaterThan(metrics.watchlist?.bottom ?? 0);
  245 |   expect(Math.abs((metrics.log?.bottom ?? 0) - (metrics.marketColumn?.bottom ?? 0))).toBeLessThanOrEqual(2);
  246 |   // Weekly Goals and Upgrade Card now sit in the right rail under positions, so they're
  247 |   // visible regardless of the height the chart panel consumes.
  248 |   expect(metrics.weeklyGoals?.y ?? 0).toBeGreaterThan(metrics.positions?.y ?? 0);
  249 |   expect(metrics.upgradeCard?.y ?? 0).toBeGreaterThan(metrics.weeklyGoals?.y ?? 0);
  250 |   expect(metrics.upgradeCard?.bottom ?? 0).toBeLessThanOrEqual((metrics.rightRail?.bottom ?? 0) + 1);
  251 |   expect(metrics.tickerRows.every((row) => row.height <= 32 && row.topSpread <= 3)).toBe(true);
  252 |   expect(metrics.log?.height ?? 0).toBeGreaterThan(250);
  253 |   expect(metrics.overlaps).toEqual([]);
  254 |   expect(metrics.overflows).toEqual([]);
  255 |   // .controls-column has overflow:hidden so visual stays clean; .upgrade-card content
  256 |   // can grow taller than its grid slot when the panel above (chart + fundamentals tabs)
  257 |   // takes its share. Both are tolerated — the design intentionally favors information
  258 |   // density over rigid pixel budgeting.
  259 |   const intolerable = metrics.internalOverflows.filter(
  260 |     (selector) => selector !== '.controls-column' && selector !== '.upgrade-card'
  261 |   );
  262 |   expect(intolerable).toEqual([]);
  263 | });
  264 | 
  265 | test.describe('stock detail panel', () => {
  266 |   test('renders an extended candlestick chart with prior history and switches tabs', async ({ page }) => {
  267 |     await bootIntoGame(page);
  268 | 
  269 |     const chart = page.locator('.candle-chart');
  270 |     await expect(chart).toBeVisible();
  271 |     // Monday: 15 prior-history candles + 1 current-week candle (no future "shadow").
  272 |     await expect(chart.locator('rect[rx="1.2"]')).toHaveCount(16);
  273 |     await expect(chart.getByText('MON')).toBeVisible();
  274 |     await expect(chart.getByText('FRI')).toBeVisible();
  275 |     // Moving-average line + support + resistance + this-week divider
  276 |     await expect(chart.locator('polyline')).toBeVisible();
  277 | 
  278 |     // Fundamentals is the default tab.
  279 |     await expect(page.getByText('P/E Ratio')).toBeVisible();
  280 |     await expect(page.getByText('Market Cap')).toBeVisible();
  281 |     await expect(page.getByText('Short Interest')).toBeVisible();
  282 | 
  283 |     await page.getByRole('tab', { name: 'Technicals' }).click();
  284 |     await expect(page.getByText('Trend', { exact: true })).toBeVisible();
  285 |     await expect(page.getByText('RSI')).toBeVisible();
  286 |     await expect(page.getByText('52W Range')).toBeVisible();
  287 | 
  288 |     await page.getByRole('tab', { name: 'News' }).click();
  289 |     await expect(page.locator('.news-pane li')).toHaveCount(3);
  290 |   });
  291 | });
  292 | 
  293 | test.describe('trophy shelf', () => {
  294 |   test('shows a single unlocked trophy for a fresh save', async ({ page }) => {
  295 |     await bootIntoGame(page);
  296 | 
  297 |     const shelf = page.locator('.trophy-shelf');
  298 |     await expect(shelf).toBeVisible();
  299 |     await expect(shelf.locator('.trophy-count')).toContainText('1/5');
  300 |     await expect(shelf.locator('[data-tier="BEDROOM_DAY_TRADER"]')).toHaveAttribute('data-unlocked', 'true');
  301 |     await expect(shelf.locator('[data-tier="PROP_DESK_ROOKIE"]')).toHaveAttribute('data-unlocked', 'false');
  302 |     // Locked slot tooltip names the tier the player needs to reach.
  303 |     await expect(shelf.locator('[data-tier="PROP_DESK_ROOKIE"]')).toHaveAttribute('title', /Prop Desk Rookie/);
  304 |   });
  305 | 
  306 |   test('shows persistent unlocks from prior runs and the starter perk applies', async ({ context, page }) => {
  307 |     await context.addInitScript(() => {
  308 |       window.localStorage.setItem(
  309 |         'career-roguelite-trader-save-v1',
  310 |         JSON.stringify({
  311 |           unlocks: { betterNewsFeed: false, secondMonitor: false },
  312 |           bestNetWorth: 0,
  313 |           runsCompleted: 1,
  314 |           hasCompletedTutorial: true,
  315 |           tiersEverReached: ['BEDROOM_DAY_TRADER', 'PROP_DESK_ROOKIE', 'STOCK_BROKER'],
  316 |           highestTier: 'STOCK_BROKER'
  317 |         })
  318 |       );
  319 |     });
  320 |     await bootIntoGame(page);
  321 | 
  322 |     const shelf = page.locator('.trophy-shelf');
> 323 |     await expect(shelf.locator('.trophy-count')).toContainText('3/5');
      |                                                  ^ Error: expect(locator).toContainText(expected) failed
  324 |     // Unlocked slot tooltip carries the artifact name.
  325 |     await expect(shelf.locator('[data-tier="PROP_DESK_ROOKIE"]')).toHaveAttribute('title', /Rookie Trophy/);
  326 |     await expect(shelf.locator('[data-tier="STOCK_BROKER"]')).toHaveAttribute('title', /Brass Nameplate/);
  327 |     await expect(shelf.locator('[data-tier="FUND_MANAGER"]')).toHaveAttribute('data-unlocked', 'false');
  328 | 
  329 |     // Starting perk: $5000 + $1000 broker perk = $6000 cash on the HUD.
  330 |     const cashCell = page.locator('.command-deck .hud div').filter({
  331 |       has: page.locator('span', { hasText: 'Cash' })
  332 |     }).locator('strong');
  333 |     await expect(cashCell).toHaveText('$6,000');
  334 |     await expect(page.getByText(/Broker reputation/)).toBeVisible();
  335 |   });
  336 | });
  337 | 
  338 | test.describe('title screen', () => {
  339 |   test('shows the title screen on load with a Start a new run button', async ({ page }) => {
  340 |     await page.goto('/');
  341 |     await expect(page.getByRole('heading', { name: 'Career Roguelite Trader' })).toBeVisible();
  342 |     await expect(page.getByRole('button', { name: 'Start a new run' })).toBeVisible();
  343 |     await expect(page.getByText('Hall of Fame')).toBeVisible();
  344 |     await expect(page.getByText('Achievements')).toBeVisible();
  345 |   });
  346 | 
  347 |   test('Hall of Fame opens from the title and shows the empty state for a fresh save', async ({ page }) => {
  348 |     await page.goto('/');
  349 |     await page.getByRole('button', { name: /Hall of Fame/ }).click();
  350 |     const hof = page.getByRole('dialog', { name: 'Hall of Fame' });
  351 |     await expect(hof).toBeVisible();
  352 |     await expect(hof.getByText(/No completed runs yet/)).toBeVisible();
  353 |   });
  354 | 
  355 |   test('Achievements panel opens from the title and lists locked achievements', async ({ page }) => {
  356 |     await page.goto('/');
  357 |     await page.getByRole('button', { name: /🎖 Achievements/ }).click();
  358 |     const panel = page.getByRole('dialog', { name: 'Achievements' });
  359 |     await expect(panel).toBeVisible();
  360 |     await expect(panel.locator('.ach-item')).toHaveCount(20);
  361 |     // No achievements unlocked yet on a fresh save.
  362 |     await expect(panel.locator('.ach-item.unlocked')).toHaveCount(0);
  363 |   });
  364 | });
  365 | 
  366 | test.describe('keyboard shortcuts and pause', () => {
  367 |   test('Esc opens the pause menu and Resume closes it', async ({ page }) => {
  368 |     await bootIntoGame(page);
  369 |     await page.keyboard.press('Escape');
  370 |     const pause = page.getByRole('dialog', { name: 'Pause menu' });
  371 |     await expect(pause).toBeVisible();
  372 |     await pause.getByRole('button', { name: 'Resume run' }).click();
  373 |     await expect(pause).toBeHidden();
  374 |   });
  375 | 
  376 |   test('? key opens the shortcut cheatsheet', async ({ page }) => {
  377 |     await bootIntoGame(page);
  378 |     await page.keyboard.press('?');
  379 |     const sheet = page.getByRole('dialog', { name: 'Keyboard shortcuts' });
  380 |     await expect(sheet).toBeVisible();
  381 |     await expect(sheet.getByText(/Toggle audio mute/)).toBeVisible();
  382 |   });
  383 | 
  384 |   test('Space advances the day', async ({ page }) => {
  385 |     await bootIntoGame(page);
  386 |     await expect(page.getByLabel('Market week')).toContainText('MON');
  387 |     // Use focus on body so input handlers don't catch the space.
  388 |     await page.locator('body').click({ position: { x: 1, y: 1 } });
  389 |     await page.keyboard.press('Space');
  390 |     await expect(page.getByLabel('Market week')).toContainText('TUE');
  391 |   });
  392 | });
  393 | 
  394 | test.describe('onboarding', () => {
  395 |   test.beforeEach(async ({ context }) => {
  396 |     // Override the default beforeEach: clear save so the tutorial runs.
  397 |     await context.addInitScript(() => {
  398 |       window.localStorage.removeItem('career-roguelite-trader-save-v1');
  399 |     });
  400 |   });
  401 | 
  402 |   test('first-time player sees the tutorial and can skip it', async ({ page }) => {
  403 |     await bootIntoGame(page);
  404 | 
  405 |     const tutorial = page.getByRole('dialog', { name: 'Tutorial' });
  406 |     await expect(tutorial).toBeVisible();
  407 |     await expect(tutorial.getByText('Step 1 of 6')).toBeVisible();
  408 |     await expect(tutorial.getByRole('heading', { name: 'This is your run status' })).toBeVisible();
  409 | 
  410 |     await tutorial.getByRole('button', { name: 'Got it' }).click();
  411 |     await expect(tutorial.getByText('Step 2 of 6')).toBeVisible();
  412 |     await expect(tutorial.getByRole('heading', { name: 'Read the tape' })).toBeVisible();
  413 | 
  414 |     await tutorial.getByRole('button', { name: 'Skip tutorial' }).click();
  415 |     await expect(tutorial).toBeHidden();
  416 | 
  417 |     // Ensure the skip persisted to localStorage so the next load is uninterrupted.
  418 |     const savedFlag = await page.evaluate(() => {
  419 |       const raw = window.localStorage.getItem('career-roguelite-trader-save-v1');
  420 |       return raw ? (JSON.parse(raw).hasCompletedTutorial ?? null) : null;
  421 |     });
  422 |     expect(savedFlag).toBe(true);
  423 |   });
```