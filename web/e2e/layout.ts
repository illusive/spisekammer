// Layout checks shared by the tests (S-019): the targets the app must hit on a phone.

import { expect, type Locator, type Page } from '@playwright/test';
import { topSheet } from './fixtures.ts';

const TOLERANCE = 1.5; // px, for sub-pixel rounding

// Waits for the sheet's slide-in to finish, so boxes are measured where they end up.
export async function settled(page: Page): Promise<void> {
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
}

// The open sheet sits inside the screen: its bottom on the screen's bottom edge, its top below the
// screen's top, and its content scrolls when it is taller than the sheet.
export async function expectSheetFits(page: Page): Promise<void> {
  await settled(page);
  const box = await topSheet(page).evaluate((d) => {
    const r = d.getBoundingClientRect();
    const body = d.querySelector('.sheet-body') as HTMLElement;
    return { top: r.top, bottom: r.bottom, viewport: window.innerHeight, bodyScrolls: body.scrollHeight > body.clientHeight + 1, bodyOverflow: getComputedStyle(body).overflowY, bodyBottom: body.getBoundingClientRect().bottom };
  });
  expect(box.top, 'sheet top inside the screen').toBeGreaterThanOrEqual(-TOLERANCE);
  expect(Math.abs(box.bottom - box.viewport), `sheet bottom (${box.bottom}) on the screen's bottom edge (${box.viewport})`).toBeLessThanOrEqual(TOLERANCE);
  expect(box.bodyBottom, 'sheet content ends inside the screen').toBeLessThanOrEqual(box.viewport + TOLERANCE);
  expect(box.bodyOverflow).toBe('auto');
}

// Scrolling the sheet's content to the end leaves its header where it was.
export async function expectHeaderStays(page: Page): Promise<void> {
  const sheet = topSheet(page);
  const before = await sheet.locator('h2').first().boundingBox();
  await sheet.locator('.sheet-body').evaluate((b) => b.scrollTo(0, b.scrollHeight));
  await page.waitForTimeout(100);
  const after = await sheet.locator('h2').first().boundingBox();
  expect(before && after && Math.abs(before.y - after.y), 'header stays at the top').toBeLessThanOrEqual(TOLERANCE);
}

// The page itself scrolls (no sheet left the page locked), when it is taller than the screen.
export async function expectPageScrolls(page: Page): Promise<void> {
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveClass(/sheet-open/);
  const result = await page.evaluate(async () => {
    const tall = document.documentElement.scrollHeight > window.innerHeight + 4;
    window.scrollTo(0, 0);
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    const moved = window.scrollY > 0;
    window.scrollTo(0, 0);
    return { tall, moved };
  });
  if (result.tall) expect(result.moved, 'the page scrolls').toBe(true);
}

// Nothing makes the page scroll sideways.
export async function expectNoSideScroll(page: Page): Promise<void> {
  const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(widths.scroll, 'no sideways scroll').toBeLessThanOrEqual(widths.client + 1);
}

// Every visible button, link and field is easy to hit: at least 44 px high and 24 px wide.
export async function expectTapTargets(scope: Locator): Promise<void> {
  const small = await scope.evaluate((root) => {
    const found: string[] = [];
    for (const el of root.querySelectorAll<HTMLElement>('button, a[href], input:not([type=radio]):not([type=checkbox]):not([type=hidden]), select, textarea, label:has(> input[type=radio].sr-only), label:has(> input[type=checkbox].sr-only)')) {
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (r.width === 0 || r.height === 0 || style.visibility === 'hidden' || el.closest('[aria-hidden="true"], .sr-only')) continue;
      if (r.height < 43.5 || r.width < 24) found.push(`${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30)}" ${Math.round(r.width)}×${Math.round(r.height)}`);
    }
    return found;
  });
  expect(small, 'tap targets smaller than 44 px high or 24 px wide').toEqual([]);
}

// Every text, select and date field in the scope is 48 px high.
export async function expectEqualFields(scope: Locator): Promise<void> {
  const heights = await scope.evaluate((root) =>
    [...root.querySelectorAll<HTMLElement>('input[type=text], input:not([type]), input[type=email], input[type=date], input[type=search], select')]
      .filter((el) => el.getBoundingClientRect().height > 0 && !el.closest('[role=search], .rounded-full'))
      .map((el) => ({ name: el.getAttribute('placeholder') || el.id || el.tagName, h: Math.round(el.getBoundingClientRect().height) })),
  );
  expect(heights.length, 'fields to check').toBeGreaterThan(0);
  for (const f of heights) expect(f.h, `field ${f.name}`).toBe(48);
}
