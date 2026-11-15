// Without a connection (AGENTS.md): once loaded, the app starts and shows what is stored, offline.

import { expect, test } from '@playwright/test';
import { openApp, seed } from './fixtures.ts';

test('starts offline after one visit, with the things still there', async ({ page, context }) => {
  test.setTimeout(90_000); // the first install downloads the whole app, slower with tests in parallel
  await openApp(page);
  await seed(page, { items: [{ name: 'Havregryn', placeId: 'pantry', category: 'dry' }] });
  test.skip(!(await page.evaluate(() => 'serviceWorker' in navigator)), 'this browser has no service worker here');
  // The service worker has the app once it is active and controls the page (polled, so a change
  // that happened before the check is not missed).
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), undefined, { timeout: 60_000, polling: 250 });

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Hvad har du?' })).toBeVisible();
  await page.getByRole('link', { name: /^Skabe/ }).click();
  await expect(page.getByRole('button', { name: /^Havregryn/ })).toBeVisible();
});
