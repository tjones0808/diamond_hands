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
  await expect(page.getByLabel('Market week')).toContainText('WED');
  await expect(page.locator('.event-card')).toBeVisible();

  await page.getByRole('button', { name: 'Advance Day' }).click();
  await page.getByRole('button', { name: 'Advance Day' }).click();
  await page.getByRole('button', { name: 'Settle Expiry' }).click();

  await expect(page.getByText(/expired/i)).toBeVisible();
  await expect(page.getByLabel('Market week')).toContainText('MON');
});

test('dashboard uses a compact top cockpit without page scroll on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1905, height: 768 });
  await page.goto('/');
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
  await expect(page.locator('.terminal > .positions')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Stock Intel' })).toBeVisible();
  await expect(page.getByText('Signal Quality', { exact: true })).toBeVisible();
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
    const progressColumn = document.querySelector('.progress-column')?.getBoundingClientRect();
    const watchlist = document.querySelector('.watchlist')?.getBoundingClientRect();
    const log = document.querySelector('.log')?.getBoundingClientRect();
    const positions = document.querySelector('.positions')?.getBoundingClientRect();
    const layoutRects = ['.market-column', '.controls-column', '.positions']
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
      progressColumn,
      watchlist,
      log,
      positions,
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
  expect(metrics.controlsColumn?.x).toBeLessThan(metrics.positions?.x ?? 0);
  expect(metrics.positions?.width ?? 0).toBeLessThan(metrics.marketColumn?.width ?? 0);
  expect(metrics.positions?.width ?? 0).toBeLessThan(metrics.controlsColumn?.width ?? 0);
  expect(metrics.watchlist?.x).toBe(metrics.log?.x);
  expect(Math.abs((metrics.watchlist?.width ?? 0) - (metrics.log?.width ?? 0))).toBeLessThanOrEqual(2);
  expect(metrics.log?.y).toBeGreaterThan(metrics.watchlist?.bottom ?? 0);
  expect(Math.abs((metrics.log?.bottom ?? 0) - (metrics.marketColumn?.bottom ?? 0))).toBeLessThanOrEqual(2);
  expect(metrics.positions?.height ?? 0).toBeGreaterThanOrEqual(metrics.controlsColumn?.height ?? 0);
  expect(metrics.tradeGrid?.y).toBeLessThan(987);
  expect(metrics.tradeGrid?.bottom ?? 0).toBeLessThanOrEqual((metrics.tradeTicket?.bottom ?? 0) + 1);
  expect(metrics.progressColumn?.y ?? 0).toBeGreaterThanOrEqual((metrics.tradeGrid?.bottom ?? 0) + 1);
  expect(metrics.tickerRows.every((row) => row.height <= 32 && row.topSpread <= 3)).toBe(true);
  expect(metrics.log?.height ?? 0).toBeGreaterThan(250);
  expect(metrics.overlaps).toEqual([]);
  expect(metrics.overflows).toEqual([]);
  expect(metrics.internalOverflows).toEqual([]);
});
