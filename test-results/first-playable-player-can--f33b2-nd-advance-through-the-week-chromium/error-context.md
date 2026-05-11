# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: first-playable.spec.ts >> player can buy a call and advance through the week
- Location: tests\first-playable.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /Buy Call/i })
    - locator resolved to <button type="button">Buy Call $29</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="section-heading">…</div> from <div class="progress-column">…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="section-heading">…</div> from <div class="progress-column">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    51 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="section-heading">…</div> from <div class="progress-column">…</div> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling

```

# Page snapshot

```yaml
- main [ref=e3]:
  - region "Market tape" [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]: Rogue Street
      - strong [ref=e7]: Cash Velocity Desk
    - generic [ref=e8]:
      - generic [ref=e9]:
        - strong [ref=e10]: FIZZ
        - generic [ref=e11]: $27.61
        - emphasis [ref=e12]: +0.0%
      - generic [ref=e13]:
        - strong [ref=e14]: QBIT
        - generic [ref=e15]: $61.12
        - emphasis [ref=e16]: +0.0%
      - generic [ref=e17]:
        - strong [ref=e18]: VACC
        - generic [ref=e19]: $47.08
        - emphasis [ref=e20]: +0.0%
      - generic [ref=e21]:
        - strong [ref=e22]: DRON
        - generic [ref=e23]: $68.08
        - emphasis [ref=e24]: +0.0%
      - generic [ref=e25]:
        - strong [ref=e26]: GLMR
        - generic [ref=e27]: $28.69
        - emphasis [ref=e28]: +0.0%
      - generic [ref=e29]:
        - strong [ref=e30]: ORBX
        - generic [ref=e31]: $72.00
        - emphasis [ref=e32]: +0.0%
      - generic [ref=e33]:
        - strong [ref=e34]: NVRA
        - generic [ref=e35]: $50.69
        - emphasis [ref=e36]: +0.0%
      - generic [ref=e37]:
        - strong [ref=e38]: BRIK
        - generic [ref=e39]: $22.95
        - emphasis [ref=e40]: +0.0%
    - generic [ref=e41]:
      - generic [ref=e42]: CALM
      - strong [ref=e43]: W1 / MON
  - region "Career status cockpit" [ref=e44]:
    - region "Room scene" [ref=e45]
    - complementary "Career and week status" [ref=e48]:
      - generic "Run status" [ref=e49]:
        - generic [ref=e50]:
          - strong [ref=e51]: Bedroom Day Trader
          - text: Career
        - generic [ref=e52]:
          - strong [ref=e53]: $5,000
          - text: Cash
        - generic [ref=e54]:
          - strong [ref=e55]: $5,000
          - text: Net worth
        - generic [ref=e56]:
          - strong [ref=e57]: "40"
          - text: Reputation
        - generic [ref=e58]:
          - strong [ref=e59]: "0"
          - text: XP
        - generic [ref=e60]:
          - strong [ref=e61]: CALM
          - text: Regime
        - generic [ref=e62]:
          - strong [ref=e63]: $0
          - text: Best run
      - region "Market week" [ref=e64]:
        - generic [ref=e65]:
          - heading "Week 1" [level=2] [ref=e66]
          - generic [ref=e67]: Friday expiry is the judgment day.
        - generic [ref=e68]:
          - generic [ref=e69]:
            - strong [ref=e70]: MON
            - text: Read
          - generic [ref=e71]:
            - strong [ref=e72]: TUE
            - text: Build
          - generic [ref=e73]:
            - strong [ref=e74]: WED
            - text: Shock
          - generic [ref=e75]:
            - strong [ref=e76]: THU
            - text: Risk
          - generic [ref=e77]:
            - strong [ref=e78]: FRI
            - text: Expiry
  - region "Trading terminal" [ref=e79]:
    - region "Trading terminal" [ref=e80]:
      - region "Market choices and log" [ref=e81]:
        - generic "Watchlist" [ref=e82]:
          - button "FIZZ +0.0% $27.61" [ref=e83]:
            - generic [ref=e84]: FIZZ
            - emphasis [ref=e85]: +0.0%
            - strong [ref=e86]: $27.61
          - button "QBIT +0.0% $61.12" [ref=e87]:
            - generic [ref=e88]: QBIT
            - emphasis [ref=e89]: +0.0%
            - strong [ref=e90]: $61.12
          - button "VACC +0.0% $47.08" [ref=e91]:
            - generic [ref=e92]: VACC
            - emphasis [ref=e93]: +0.0%
            - strong [ref=e94]: $47.08
          - button "DRON +0.0% $68.08" [ref=e95]:
            - generic [ref=e96]: DRON
            - emphasis [ref=e97]: +0.0%
            - strong [ref=e98]: $68.08
          - button "GLMR +0.0% $28.69" [ref=e99]:
            - generic [ref=e100]: GLMR
            - emphasis [ref=e101]: +0.0%
            - strong [ref=e102]: $28.69
          - button "ORBX +0.0% $72.00" [ref=e103]:
            - generic [ref=e104]: ORBX
            - emphasis [ref=e105]: +0.0%
            - strong [ref=e106]: $72.00
          - button "NVRA +0.0% $50.69" [ref=e107]:
            - generic [ref=e108]: NVRA
            - emphasis [ref=e109]: +0.0%
            - strong [ref=e110]: $50.69
          - button "BRIK +0.0% $22.95" [ref=e111]:
            - generic [ref=e112]: BRIK
            - emphasis [ref=e113]: +0.0%
            - strong [ref=e114]: $22.95
        - generic [ref=e115]:
          - heading "Week Log" [level=2] [ref=e116]
          - paragraph [ref=e118]: You boot up your battered trading rig.
      - region "Trading controls" [ref=e119]:
        - generic [ref=e120]:
          - generic [ref=e121]:
            - heading "Trading Terminal" [level=1] [ref=e122]
            - paragraph [ref=e123]: Read the market and choose a thesis.
          - button "Advance Day" [ref=e124] [cursor=pointer]
        - article [ref=e125]:
          - generic [ref=e126]:
            - generic [ref=e127]:
              - heading "Stock Intel" [level=2] [ref=e128]
              - generic [ref=e129]: ENERGY
            - strong [ref=e130]: Fizzline Energy
            - paragraph [ref=e131]: The tape is jumpy and the signal quality is poor.
          - generic "FIZZ metrics" [ref=e132]:
            - generic [ref=e133]:
              - generic [ref=e134]: Price
              - generic [ref=e135]: $27.61
            - generic [ref=e136]:
              - generic [ref=e137]: Move
              - generic [ref=e138]: +0.0%
            - generic [ref=e139]:
              - generic [ref=e140]: Signal Quality
              - generic [ref=e141]: 41%
            - generic [ref=e142]:
              - generic [ref=e143]: Volatility
              - generic [ref=e144]: 13%
          - generic [ref=e145]:
            - img [ref=e146]
            - emphasis [ref=e148]: Options tape is jumpy
        - region "Trade ticket" [ref=e149]:
          - generic [ref=e150]:
            - generic [ref=e151]:
              - heading "Trade Ticket" [level=2] [ref=e152]
              - paragraph [ref=e153]: FIZZ thesis, size, execute.
            - generic [ref=e154]:
              - generic [ref=e155]:
                - text: Shares
                - spinbutton "Shares" [ref=e156]: "10"
              - generic [ref=e157]:
                - text: Contracts
                - spinbutton "Contracts" [ref=e158]: "1"
          - generic "Ticket estimate" [ref=e159]:
            - generic [ref=e160]:
              - text: Est. Share Cost
              - generic [ref=e161]: $276
            - generic [ref=e162]:
              - text: Max Option Risk
              - generic [ref=e163]: $3.41
            - generic [ref=e164]:
              - text: Call $29
              - generic [ref=e165]: $3.41
            - generic [ref=e166]:
              - text: Put $26
              - generic [ref=e167]: $3.38
          - generic [ref=e168]:
            - button "Buy 10 Shares" [ref=e169] [cursor=pointer]
            - button "Sell 10 Shares" [ref=e170] [cursor=pointer]
            - button "Buy Call $29" [ref=e171] [cursor=pointer]
            - button "Buy Put $26" [ref=e172] [cursor=pointer]
            - button "Close Options" [ref=e173] [cursor=pointer]
        - generic:
          - region "Weekly goals" [ref=e174]:
            - generic [ref=e175]:
              - heading "Weekly Goals" [level=2] [ref=e176]
              - generic [ref=e177]: Gate
            - generic:
              - generic [ref=e178]:
                - generic [ref=e179]:
                  - strong [ref=e180]: Reach $6,000 net worth
                  - text: Cash plus marked shares
                - generic [ref=e181]: $5,000 / $6,000
              - generic [ref=e184]:
                - generic [ref=e185]:
                  - strong [ref=e186]: Build street rep to 42
                  - text: Protect the week and win cleanly
                - generic [ref=e187]: 40 / 42
              - generic [ref=e190]:
                - generic [ref=e191]:
                  - strong [ref=e192]: Bank 4 XP lessons
                  - text: Survive expiries and learn
                - generic [ref=e193]: 0 / 4
          - generic [ref=e195]:
            - generic [ref=e196]:
              - 'heading "Next: PROP DESK ROOKIE" [level=2] [ref=e197]'
              - paragraph [ref=e198]: Bad bedroom. Buy tools, clear goals, climb after Friday expiry.
            - generic:
              - button "Second Monitor $750" [ref=e199] [cursor=pointer]
              - button "News Feed $1,200" [ref=e200] [cursor=pointer]
      - generic [ref=e201]:
        - generic [ref=e202]:
          - heading "Positions" [level=2] [ref=e203]
          - generic [ref=e204]: Net worth $5,000
        - paragraph [ref=e205]: No positions yet. The market is waiting.
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | 
  3   | test('player can buy a call and advance through the week', async ({ page }) => {
  4   |   await page.goto('/');
  5   | 
  6   |   await expect(page.getByRole('heading', { name: 'Trading Terminal' })).toBeVisible();
  7   |   await expect(page.getByLabel('Market week')).toContainText('MON');
  8   | 
> 9   |   await page.getByRole('button', { name: /Buy Call/i }).click();
      |                                                         ^ Error: locator.click: Test timeout of 30000ms exceeded.
  10  |   await expect(page.getByText(/Bought 1 .* CALL/i)).toBeVisible();
  11  | 
  12  |   await page.getByRole('button', { name: 'Advance Day' }).click();
  13  |   await expect(page.getByLabel('Market week')).toContainText('TUE');
  14  | 
  15  |   await page.getByRole('button', { name: 'Advance Day' }).click();
  16  |   await expect(page.getByLabel('Market week')).toContainText('WED');
  17  |   await expect(page.locator('.event-card')).toBeVisible();
  18  | 
  19  |   await page.getByRole('button', { name: 'Advance Day' }).click();
  20  |   await page.getByRole('button', { name: 'Advance Day' }).click();
  21  |   await page.getByRole('button', { name: 'Settle Expiry' }).click();
  22  | 
  23  |   await expect(page.getByText(/expired/i)).toBeVisible();
  24  |   await expect(page.getByLabel('Market week')).toContainText('MON');
  25  | });
  26  | 
  27  | test('dashboard uses a compact top cockpit without page scroll on desktop', async ({ page }) => {
  28  |   await page.setViewportSize({ width: 1905, height: 768 });
  29  |   await page.goto('/');
  30  |   await page.locator('.room-canvas canvas').waitFor();
  31  |   await page.getByRole('button', { name: 'Advance Day' }).click();
  32  |   await page.getByRole('button', { name: 'Advance Day' }).click();
  33  |   await expect(page.locator('.event-card')).toBeVisible();
  34  | 
  35  |   await expect(page.locator('.command-deck .room-panel')).toBeVisible();
  36  |   await expect(page.locator('.command-deck .hud')).toBeVisible();
  37  |   await expect(page.locator('.command-deck .week-strip')).toBeVisible();
  38  |   await expect(page.locator('.terminal-panel .hud')).toHaveCount(0);
  39  |   await expect(page.locator('.terminal-panel .week-strip')).toHaveCount(0);
  40  |   await expect(page.locator('.ticker').first()).toHaveText(/^[A-Z]+[+-]?\d+\.\d%\$\d+\.\d{2}$/);
  41  |   await expect(page.locator('.quote-divider')).toHaveCount(0);
  42  |   await expect(page.locator('.market-column .watchlist')).toBeVisible();
  43  |   await expect(page.locator('.market-column .log')).toBeVisible();
  44  |   await expect(page.locator('.controls-column .terminal-header')).toBeVisible();
  45  |   await expect(page.locator('.terminal > .positions')).toBeVisible();
  46  |   await expect(page.getByRole('heading', { name: 'Stock Intel' })).toBeVisible();
  47  |   await expect(page.getByText('Signal Quality', { exact: true })).toBeVisible();
  48  |   await expect(page.getByRole('heading', { name: 'Trade Ticket' })).toBeVisible();
  49  |   await expect(page.getByText('Est. Share Cost')).toBeVisible();
  50  |   await expect(page.getByRole('heading', { name: 'Weekly Goals' })).toBeVisible();
  51  |   await expect(page.getByText('Reach $6,000 net worth')).toBeVisible();
  52  | 
  53  |   const metrics = await page.evaluate(() => {
  54  |     const commandDeck = document.querySelector('.command-deck')?.getBoundingClientRect();
  55  |     const room = document.querySelector('.room-panel')?.getBoundingClientRect();
  56  |     const statusDeck = document.querySelector('.status-deck')?.getBoundingClientRect();
  57  |     const hud = document.querySelector('.command-deck .hud')?.getBoundingClientRect();
  58  |     const weekStrip = document.querySelector('.command-deck .week-strip')?.getBoundingClientRect();
  59  |     const terminal = document.querySelector('.terminal-panel')?.getBoundingClientRect();
  60  |     const marketColumn = document.querySelector('.market-column')?.getBoundingClientRect();
  61  |     const controlsColumn = document.querySelector('.controls-column')?.getBoundingClientRect();
  62  |     const tradeTicket = document.querySelector('.trade-ticket')?.getBoundingClientRect();
  63  |     const tradeGrid = document.querySelector('.trade-grid')?.getBoundingClientRect();
  64  |     const progressColumn = document.querySelector('.progress-column')?.getBoundingClientRect();
  65  |     const watchlist = document.querySelector('.watchlist')?.getBoundingClientRect();
  66  |     const log = document.querySelector('.log')?.getBoundingClientRect();
  67  |     const positions = document.querySelector('.positions')?.getBoundingClientRect();
  68  |     const layoutRects = ['.market-column', '.controls-column', '.positions']
  69  |       .map((selector) => ({ selector, rect: document.querySelector(selector)?.getBoundingClientRect() }))
  70  |       .filter((item): item is { selector: string; rect: DOMRect } => Boolean(item.rect));
  71  |     const overlaps: string[] = [];
  72  |     const overflows = layoutRects
  73  |       .filter(({ rect }) => terminal ? rect.right > terminal.right + 1 || rect.bottom > terminal.bottom + 1 || rect.left < terminal.left - 1 || rect.top < terminal.top - 1 : false)
  74  |       .map(({ selector }) => selector);
  75  |     const internalOverflows = ['.market-column', '.controls-column', '.career-card', '.upgrade-card', '.positions', '.log', '.watchlist', '.trade-grid', '.signal-card']
  76  |       .filter((selector) => {
  77  |         const item = document.querySelector(selector);
  78  |         return item ? item.scrollWidth > item.clientWidth + 3 || item.scrollHeight > item.clientHeight + 3 : false;
  79  |       });
  80  | 
  81  |     for (let outer = 0; outer < layoutRects.length; outer += 1) {
  82  |       for (let inner = outer + 1; inner < layoutRects.length; inner += 1) {
  83  |         const a = layoutRects[outer];
  84  |         const b = layoutRects[inner];
  85  |         const width = Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left);
  86  |         const height = Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top);
  87  |         if (width > 1 && height > 1) {
  88  |           overlaps.push(`${a.selector} overlaps ${b.selector}`);
  89  |         }
  90  |       }
  91  |     }
  92  |     const tickerRows = Array.from(document.querySelectorAll('.ticker')).map((ticker) => {
  93  |       const row = ticker.getBoundingClientRect();
  94  |       const parts = Array.from(ticker.children).map((child) => child.getBoundingClientRect());
  95  |       const childTops = parts.map((part) => Math.round(part.top));
  96  |       const topSpread = childTops.length > 0 ? Math.max(...childTops) - Math.min(...childTops) : 0;
  97  |       return {
  98  |         height: Math.round(row.height),
  99  |         topSpread
  100 |       };
  101 |     });
  102 | 
  103 |     return {
  104 |       hasHorizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  105 |       hasVerticalScroll: document.documentElement.scrollHeight > document.documentElement.clientHeight,
  106 |       commandDeck,
  107 |       room,
  108 |       statusDeck,
  109 |       hud,
```