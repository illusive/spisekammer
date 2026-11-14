// Without a connection (AGENTS.md): once loaded, the app starts and shows what is stored, offline.

import { expect, test } from '@playwright/test';
import { openApp, seed } from './fixtures.ts';

test('starts offline after one visit, with the things still there', async ({ page, context }) => {
  await openApp(page);
  await seed(page, { items: [{ name: 'Havregryn', placeId: 'pantry', category: 'dry' }] });
  // The service worker has the app once it controls the page.
  const ready = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return false;
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise((r) => navigator.serviceWorker.addEventListener('controllerchange', () => r(null), { once: true }));
    return true;
  });
  test.skip(!ready, 'this browser has no service worker here');

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Hvad har du?' })).toBeVisible();
  await page.getByRole('link', { name: /^Skabe/ }).click();
  await expect(page.getByRole('button', { name: /^Havregryn/ })).toBeVisible();
});
