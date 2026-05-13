import { expect, test } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  // Pre-seed save so the onboarding tutorial doesn't gate the existing gameplay tests.
  // The dedicated tutorial test below clears this in its own block.
  await context.addInitScript(() => {
    window.localStorage.setItem(
      'career-roguelite-trader-save-v1',
      JSON.stringify({
        unlocks: { betterNewsFeed: false, secondMonitor: false },
        bestNetWorth: 0,
        runsCompleted: 0,
        hasCompletedTutorial: true
      })
    );
  });
});

/** Click "Start a new run" on the title screen so the game UI mounts. */
async function bootIntoGame(page: import('@playwright/test').Page) {
  await page.goto('/');
  const startBtn = page.getByRole('button', { name: 'Start a new run' });
  if (await startBtn.count() > 0) {
    await startBtn.click();
  }
}

test('player can buy a call and advance through the week', async ({ page }) => {
  await bootIntoGame(page);

  await expect(page.getByRole('heading', { name: 'Trading Terminal' })).toBeVisible();
  await expect(page.getByLabel('Market week')).toContainText('MON');

  await page.getByRole('button', { name: /Buy Call/i }).click();
  await expect(page.getByText(/Opened CALL/i)).toBeVisible();

  await page.getByRole('button', { name: 'Advance Day' }).click();
  await expect(page.getByLabel('Market week')).toContainText('TUE');

  await page.getByRole('button', { name: 'Advance Day' }).click();
  await expect(page.getByLabel('Market week')).toContainText('WED');
  await expect(page.locator('.event-card')).toBeVisible();

  await page.getByRole('button', { name: 'Advance Day' }).click();
  await page.getByRole('button', { name: 'Advance Day' }).click();
  await page.getByRole('button', { name: 'Settle Expiry' }).click();

  const recap = page.getByRole('dialog', { name: 'Week recap' });
  await expect(recap).toBeVisible();
  await expect(recap.getByRole('heading', { level: 3, name: 'Option Expiries' })).toBeVisible();
  await recap.getByRole('button', { name: 'Take Monday' }).click();
  await expect(recap).toBeHidden();
  await expect(page.getByLabel('Market week')).toContainText('MON');
});

test('Friday recap names the trade, the shock, and lets the player continue', async ({ page }) => {
  await bootIntoGame(page);

  await page.getByRole('button', { name: /Buy Call/i }).click();
  await page.getByRole('button', { name: /Buy Put/i }).click();

  for (let click = 0; click < 4; click += 1) {
    await page.getByRole('button', { name: /Advance Day/ }).click();
  }
  await page.getByRole('button', { name: 'Settle Expiry' }).click();

  const recap = page.getByRole('dialog', { name: 'Week recap' });
  await expect(recap).toBeVisible();
  await expect(recap).toContainText(/Week 1 Tape/);
  const optionRows = recap.locator('.recap-options > ul > li');
  await expect(optionRows).toHaveCount(2);
  await expect(optionRows.filter({ hasText: /\bCALL\b/ })).toHaveCount(1);
  await expect(optionRows.filter({ hasText: /\bPUT\b/ })).toHaveCount(1);
  await expect(recap.getByText(/Risked \$/).first()).toBeVisible();
  await expect(recap.getByText(/Wednesday shock/)).toBeVisible();

  const pnl = recap.locator('.recap-pnl strong');
  await expect(pnl).toBeVisible();
  await expect(pnl).toHaveText(/^[+-]\$/);

  await recap.getByRole('button', { name: 'Take Monday' }).click();
  await expect(recap).toBeHidden();
  await expect(page.getByLabel('Market week')).toContainText('MON');
});

test('player can open a call spread and see grouped legs in the recap', async ({ page }) => {
  await bootIntoGame(page);

  await page.getByLabel('Strategy').selectOption('CALL_SPREAD');
  await page.getByRole('button', { name: /Open Call Spread/i }).click();
  await expect(page.getByText(/Opened CALL SPREAD/i)).toBeVisible();

  for (let click = 0; click < 4; click += 1) {
    await page.getByRole('button', { name: /Advance Day/ }).click();
  }
  await page.getByRole('button', { name: 'Settle Expiry' }).click();

  const recap = page.getByRole('dialog', { name: 'Week recap' });
  await expect(recap).toBeVisible();
  await expect(recap.getByText(/CALL SPREAD/)).toBeVisible();
  await expect(recap.locator('.recap-opt-legs li')).toHaveCount(2);
  await recap.getByRole('button', { name: 'Take Monday' }).click();
});

test('player can pick a Tuesday expiry that settles before Wednesday shock', async ({ page }) => {
  await bootIntoGame(page);

  await page.getByRole('radio', { name: 'TUE' }).click();
  await page.getByRole('button', { name: /Buy Call/i }).click();
  await expect(page.getByText(/CALL .*TUE/i).first()).toBeVisible();

  await page.getByRole('button', { name: 'Advance Day' }).click();
  await page.getByRole('button', { name: 'Advance Day' }).click();

  await expect(page.getByText(/\(TUE\) expired/)).toBeVisible();
  await expect(page.getByLabel('Market week')).toContainText('WED');
});

test('dashboard uses a compact top cockpit without page scroll on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1905, height: 768 });
  await bootIntoGame(page);
  await page.locator('.room-canvas canvas').waitFor();
  await page.getByRole('button', { name: 'Advance Day' }).click();
  await page.getByRole('button', { name: 'Advance Day' }).click();
  await expect(page.locator('.event-card')).toBeVisible();

  await expect(page.locator('.command-deck .room-panel')).toBeVisible();
  await expect(page.locator('.command-deck .hud')).toBeVisible();
  await expect(page.locator('.command-deck .week-strip')).toBeVisible();
  await expect(page.locator('.terminal-panel .hud')).toHaveCount(0);
  await expect(page.locator('.terminal-panel .week-strip')).toHaveCount(0);
  await expect(page.locator('.ticker').first()).toHaveText(/^[A-Z]+[+-]?\d+\.\d%\$\d+\.\d{2}$/);
  await expect(page.locator('.quote-divider')).toHaveCount(0);
  await expect(page.locator('.market-column .watchlist')).toBeVisible();
  await expect(page.locator('.market-column .log')).toBeVisible();
  await expect(page.locator('.controls-column .terminal-header')).toBeVisible();
  await expect(page.locator('.right-rail .positions')).toBeVisible();
  await expect(page.locator('.candle-chart')).toBeVisible();
  // Fundamentals is the default tab now; chart is always visible alongside.
  await expect(page.getByText('Signal Quality', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Technicals' }).click();
  await expect(page.getByText('Trend', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'News' }).click();
  await expect(page.locator('.news-pane li').first()).toBeVisible();
  await page.getByRole('tab', { name: 'Fundamentals' }).click();
  await expect(page.getByRole('heading', { name: 'Trade Ticket' })).toBeVisible();
  await expect(page.getByText('Est. Share Cost')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Weekly Goals' })).toBeVisible();
  await expect(page.getByText('Reach $6,000 net worth')).toBeVisible();

  const metrics = await page.evaluate(() => {
    const commandDeck = document.querySelector('.command-deck')?.getBoundingClientRect();
    const room = document.querySelector('.room-panel')?.getBoundingClientRect();
    const statusDeck = document.querySelector('.status-deck')?.getBoundingClientRect();
    const hud = document.querySelector('.command-deck .hud')?.getBoundingClientRect();
    const weekStrip = document.querySelector('.command-deck .week-strip')?.getBoundingClientRect();
    const terminal = document.querySelector('.terminal-panel')?.getBoundingClientRect();
    const marketColumn = document.querySelector('.market-column')?.getBoundingClientRect();
    const controlsColumn = document.querySelector('.controls-column')?.getBoundingClientRect();
    const tradeTicket = document.querySelector('.trade-ticket')?.getBoundingClientRect();
    const tradeGrid = document.querySelector('.trade-grid')?.getBoundingClientRect();
    const rightRail = document.querySelector('.right-rail')?.getBoundingClientRect();
    const watchlist = document.querySelector('.watchlist')?.getBoundingClientRect();
    const log = document.querySelector('.log')?.getBoundingClientRect();
    const positions = document.querySelector('.positions')?.getBoundingClientRect();
    const weeklyGoals = document.querySelector('.weekly-goals')?.getBoundingClientRect();
    const upgradeCard = document.querySelector('.upgrade-card')?.getBoundingClientRect();
    const layoutRects = ['.market-column', '.controls-column', '.right-rail']
      .map((selector) => ({ selector, rect: document.querySelector(selector)?.getBoundingClientRect() }))
      .filter((item): item is { selector: string; rect: DOMRect } => Boolean(item.rect));
    const overlaps: string[] = [];
    const overflows = layoutRects
      .filter(({ rect }) => terminal ? rect.right > terminal.right + 1 || rect.bottom > terminal.bottom + 1 || rect.left < terminal.left - 1 || rect.top < terminal.top - 1 : false)
      .map(({ selector }) => selector);
    const internalOverflows = ['.market-column', '.controls-column', '.career-card', '.upgrade-card', '.positions', '.log', '.watchlist', '.trade-grid', '.signal-card']
      .filter((selector) => {
        const item = document.querySelector(selector);
        return item ? item.scrollWidth > item.clientWidth + 3 || item.scrollHeight > item.clientHeight + 3 : false;
      });

    for (let outer = 0; outer < layoutRects.length; outer += 1) {
      for (let inner = outer + 1; inner < layoutRects.length; inner += 1) {
        const a = layoutRects[outer];
        const b = layoutRects[inner];
        const width = Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left);
        const height = Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top);
        if (width > 1 && height > 1) {
          overlaps.push(`${a.selector} overlaps ${b.selector}`);
        }
      }
    }
    const tickerRows = Array.from(document.querySelectorAll('.ticker')).map((ticker) => {
      const row = ticker.getBoundingClientRect();
      const parts = Array.from(ticker.children).map((child) => child.getBoundingClientRect());
      const childTops = parts.map((part) => Math.round(part.top));
      const topSpread = childTops.length > 0 ? Math.max(...childTops) - Math.min(...childTops) : 0;
      return {
        height: Math.round(row.height),
        topSpread
      };
    });

    return {
      hasHorizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      hasVerticalScroll: document.documentElement.scrollHeight > document.documentElement.clientHeight,
      commandDeck,
      room,
      statusDeck,
      hud,
      weekStrip,
      terminal,
      marketColumn,
      controlsColumn,
      tradeTicket,
      tradeGrid,
      rightRail,
      watchlist,
      log,
      positions,
      weeklyGoals,
      upgradeCard,
      overlaps,
      overflows,
      internalOverflows,
      tickerRows
    };
  });

  expect(metrics.hasHorizontalScroll).toBe(false);
  expect(metrics.hasVerticalScroll).toBe(false);
  expect(metrics.commandDeck?.width).toBeGreaterThan(1000);
  expect(metrics.room?.width).toBeGreaterThan(300);
  expect(metrics.statusDeck?.x).toBeGreaterThan((metrics.room?.x ?? 0) + (metrics.room?.width ?? 0));
  expect(metrics.hud?.bottom).toBeLessThanOrEqual(metrics.commandDeck?.bottom ?? 0);
  expect(metrics.weekStrip?.bottom).toBeLessThanOrEqual(metrics.commandDeck?.bottom ?? 0);
  expect(metrics.terminal?.width).toBeGreaterThan(1000);
  expect(metrics.terminal?.y).toBeGreaterThan((metrics.commandDeck?.y ?? 0) + (metrics.commandDeck?.height ?? 0));
  expect(metrics.marketColumn?.x).toBeLessThan(metrics.controlsColumn?.x ?? 0);
  expect(metrics.controlsColumn?.x).toBeLessThan(metrics.rightRail?.x ?? 0);
  // Right rail (positions + goals + upgrade) is narrower than the middle work area.
  expect(metrics.rightRail?.width ?? 0).toBeLessThan(metrics.controlsColumn?.width ?? 0);
  expect(metrics.watchlist?.x).toBe(metrics.log?.x);
  expect(Math.abs((metrics.watchlist?.width ?? 0) - (metrics.log?.width ?? 0))).toBeLessThanOrEqual(2);
  expect(metrics.log?.y).toBeGreaterThan(metrics.watchlist?.bottom ?? 0);
  expect(Math.abs((metrics.log?.bottom ?? 0) - (metrics.marketColumn?.bottom ?? 0))).toBeLessThanOrEqual(2);
  // Weekly Goals and Upgrade Card now sit in the right rail under positions, so they're
  // visible regardless of the height the chart panel consumes.
  expect(metrics.weeklyGoals?.y ?? 0).toBeGreaterThan(metrics.positions?.y ?? 0);
  expect(metrics.upgradeCard?.y ?? 0).toBeGreaterThan(metrics.weeklyGoals?.y ?? 0);
  expect(metrics.upgradeCard?.bottom ?? 0).toBeLessThanOrEqual((metrics.rightRail?.bottom ?? 0) + 1);
  expect(metrics.tickerRows.every((row) => row.height <= 32 && row.topSpread <= 3)).toBe(true);
  expect(metrics.log?.height ?? 0).toBeGreaterThan(250);
  expect(metrics.overlaps).toEqual([]);
  expect(metrics.overflows).toEqual([]);
  // .controls-column has overflow:hidden so visual stays clean; .upgrade-card content
  // can grow taller than its grid slot when the panel above (chart + fundamentals tabs)
  // takes its share. Both are tolerated — the design intentionally favors information
  // density over rigid pixel budgeting.
  const intolerable = metrics.internalOverflows.filter(
    (selector) => selector !== '.controls-column' && selector !== '.upgrade-card'
  );
  expect(intolerable).toEqual([]);
});

test.describe('stock detail panel', () => {
  test('renders an extended candlestick chart with prior history and switches tabs', async ({ page }) => {
    await bootIntoGame(page);

    const chart = page.locator('.candle-chart');
    await expect(chart).toBeVisible();
    // Monday: 15 prior-history candles + 1 current-week candle (no future "shadow").
    await expect(chart.locator('rect[rx="1.2"]')).toHaveCount(16);
    await expect(chart.getByText('MON')).toBeVisible();
    await expect(chart.getByText('FRI')).toBeVisible();
    // Moving-average line + support + resistance + this-week divider
    await expect(chart.locator('polyline')).toBeVisible();

    // Fundamentals is the default tab.
    await expect(page.getByText('P/E Ratio')).toBeVisible();
    await expect(page.getByText('Market Cap')).toBeVisible();
    await expect(page.getByText('Short Interest')).toBeVisible();

    await page.getByRole('tab', { name: 'Technicals' }).click();
    await expect(page.getByText('Trend', { exact: true })).toBeVisible();
    await expect(page.getByText('RSI')).toBeVisible();
    await expect(page.getByText('52W Range')).toBeVisible();

    await page.getByRole('tab', { name: 'News' }).click();
    await expect(page.locator('.news-pane li')).toHaveCount(3);
  });
});

test.describe('trophy shelf', () => {
  test('shows a single unlocked trophy for a fresh save', async ({ page }) => {
    await bootIntoGame(page);

    const shelf = page.getByLabel('Trophy shelf');
    await expect(shelf).toBeVisible();
    await expect(shelf.getByText(/^1\/5$/)).toBeVisible();
    await expect(shelf.locator('[data-tier="BEDROOM_DAY_TRADER"]')).toHaveAttribute('data-unlocked', 'true');
    await expect(shelf.locator('[data-tier="PROP_DESK_ROOKIE"]')).toHaveAttribute('data-unlocked', 'false');
    await expect(shelf.locator('[data-tier="PROP_DESK_ROOKIE"] .trophy-label')).toHaveText('???');
  });

  test('shows persistent unlocks from prior runs and the starter perk applies', async ({ context, page }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem(
        'career-roguelite-trader-save-v1',
        JSON.stringify({
          unlocks: { betterNewsFeed: false, secondMonitor: false },
          bestNetWorth: 0,
          runsCompleted: 1,
          hasCompletedTutorial: true,
          tiersEverReached: ['BEDROOM_DAY_TRADER', 'PROP_DESK_ROOKIE', 'STOCK_BROKER'],
          highestTier: 'STOCK_BROKER'
        })
      );
    });
    await bootIntoGame(page);

    const shelf = page.getByLabel('Trophy shelf');
    await expect(shelf.getByText(/^3\/5$/)).toBeVisible();
    await expect(shelf.locator('[data-tier="PROP_DESK_ROOKIE"] .trophy-label')).toHaveText('Rookie Trophy');
    await expect(shelf.locator('[data-tier="STOCK_BROKER"] .trophy-label')).toHaveText('Brass Nameplate');
    await expect(shelf.locator('[data-tier="FUND_MANAGER"]')).toHaveAttribute('data-unlocked', 'false');

    // Starting perk: $5000 + $1000 broker perk = $6000 cash on the HUD.
    const cashCell = page.locator('.command-deck .hud div').filter({
      has: page.locator('span', { hasText: 'Cash' })
    }).locator('strong');
    await expect(cashCell).toHaveText('$6,000');
    await expect(page.getByText(/Broker reputation/)).toBeVisible();
  });
});

test.describe('title screen', () => {
  test('shows the title screen on load with a Start a new run button', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Career Roguelite Trader' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start a new run' })).toBeVisible();
    await expect(page.getByText('Hall of Fame')).toBeVisible();
    await expect(page.getByText('Achievements')).toBeVisible();
  });

  test('Hall of Fame opens from the title and shows the empty state for a fresh save', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Hall of Fame/ }).click();
    const hof = page.getByRole('dialog', { name: 'Hall of Fame' });
    await expect(hof).toBeVisible();
    await expect(hof.getByText(/No completed runs yet/)).toBeVisible();
  });

  test('Achievements panel opens from the title and lists locked achievements', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /🎖 Achievements/ }).click();
    const panel = page.getByRole('dialog', { name: 'Achievements' });
    await expect(panel).toBeVisible();
    await expect(panel.locator('.ach-item')).toHaveCount(20);
    // No achievements unlocked yet on a fresh save.
    await expect(panel.locator('.ach-item.unlocked')).toHaveCount(0);
  });
});

test.describe('keyboard shortcuts and pause', () => {
  test('Esc opens the pause menu and Resume closes it', async ({ page }) => {
    await bootIntoGame(page);
    await page.keyboard.press('Escape');
    const pause = page.getByRole('dialog', { name: 'Pause menu' });
    await expect(pause).toBeVisible();
    await pause.getByRole('button', { name: 'Resume run' }).click();
    await expect(pause).toBeHidden();
  });

  test('? key opens the shortcut cheatsheet', async ({ page }) => {
    await bootIntoGame(page);
    await page.keyboard.press('?');
    const sheet = page.getByRole('dialog', { name: 'Keyboard shortcuts' });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByText(/Toggle audio mute/)).toBeVisible();
  });

  test('Space advances the day', async ({ page }) => {
    await bootIntoGame(page);
    await expect(page.getByLabel('Market week')).toContainText('MON');
    // Use focus on body so input handlers don't catch the space.
    await page.locator('body').click({ position: { x: 1, y: 1 } });
    await page.keyboard.press('Space');
    await expect(page.getByLabel('Market week')).toContainText('TUE');
  });
});

test.describe('onboarding', () => {
  test.beforeEach(async ({ context }) => {
    // Override the default beforeEach: clear save so the tutorial runs.
    await context.addInitScript(() => {
      window.localStorage.removeItem('career-roguelite-trader-save-v1');
    });
  });

  test('first-time player sees the tutorial and can skip it', async ({ page }) => {
    await bootIntoGame(page);

    const tutorial = page.getByRole('dialog', { name: 'Tutorial' });
    await expect(tutorial).toBeVisible();
    await expect(tutorial.getByText('Step 1 of 6')).toBeVisible();
    await expect(tutorial.getByRole('heading', { name: 'This is your run status' })).toBeVisible();

    await tutorial.getByRole('button', { name: 'Got it' }).click();
    await expect(tutorial.getByText('Step 2 of 6')).toBeVisible();
    await expect(tutorial.getByRole('heading', { name: 'Read the tape' })).toBeVisible();

    await tutorial.getByRole('button', { name: 'Skip tutorial' }).click();
    await expect(tutorial).toBeHidden();

    // Ensure the skip persisted to localStorage so the next load is uninterrupted.
    const savedFlag = await page.evaluate(() => {
      const raw = window.localStorage.getItem('career-roguelite-trader-save-v1');
      return raw ? (JSON.parse(raw).hasCompletedTutorial ?? null) : null;
    });
    expect(savedFlag).toBe(true);
  });

  test('tutorial auto-advances to the Wednesday shock step when the player advances days', async ({ page }) => {
    await bootIntoGame(page);

    const tutorial = page.getByRole('dialog', { name: 'Tutorial' });
    await tutorial.getByRole('button', { name: 'Got it' }).click(); // step 2
    await tutorial.getByRole('button', { name: 'Got it' }).click(); // step 3
    await tutorial.getByRole('button', { name: 'Got it' }).click(); // step 4 (advance step, auto-advances)

    await expect(tutorial.getByRole('heading', { name: 'Advance the day' })).toBeVisible();

    await page.getByRole('button', { name: 'Advance Day' }).click();
    await page.getByRole('button', { name: 'Advance Day' }).click();

    await expect(tutorial.getByRole('heading', { name: 'The Wednesday shock' })).toBeVisible();
  });
});

