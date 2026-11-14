// Many places and things (S-019): everything stays reachable by scrolling, nothing spills sideways.

import { expect, test } from '@playwright/test';
import { manyItems, manyPlaces, openApp, seed, topSheet } from './fixtures.ts';
import { expectNoSideScroll, expectPageScrolls, expectSheetFits } from './layout.ts';

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await seed(page, { places: manyPlaces(12), items: [...manyItems(40, 'p0'), ...manyItems(20, 'p5')] });
});

test('Hjem lists all twelve places, and the page scrolls to the last', async ({ page }) => {
  const places = page.getByRole('region', { name: 'Steder' }).getByRole('link');
  await expect(places).toHaveCount(12);
  await expectPageScrolls(page);
  await places.last().scrollIntoViewIfNeeded();
  await expect(places.last()).toBeInViewport();
  await expectNoSideScroll(page);
});

test('the place picker scrolls to its last place', async ({ page }) => {
  await page.getByRole('button', { name: 'Tilføj', exact: true }).click();
  await expectSheetFits(page);
  const last = topSheet(page).getByRole('button', { name: /^Sted 12/ });
  await last.scrollIntoViewIfNeeded();
  await expect(last).toBeInViewport();
});

test('a place with forty things scrolls to the last', async ({ page }) => {
  await page.getByRole('link', { name: /^Sted 01/ }).click(); // p0, Sted 01, has the forty
  const last = page.getByRole('button', { name: /^Ting 40/ });
  await last.scrollIntoViewIfNeeded();
  await expect(last).toBeInViewport();
  await expectNoSideScroll(page);
});

test('"Flyt til" with twelve places stays inside the sheet', async ({ page }) => {
  await page.getByRole('link', { name: /^Sted 01/ }).click();
  await page.getByRole('button', { name: /^Ting 01/ }).click();
  await expectSheetFits(page);
  const fits = await topSheet(page).evaluate((d) => {
    const sheet = d.getBoundingClientRect();
    const group = [...d.querySelectorAll('fieldset')].find((f) => f.querySelector('legend')?.textContent === 'Flyt til');
    const r = group!.getBoundingClientRect();
    return r.left >= sheet.left - 1 && r.right <= sheet.right + 1 && d.querySelector('.sheet-body')!.scrollWidth <= d.querySelector('.sheet-body')!.clientWidth + 1;
  });
  expect(fits, '"Flyt til" inside the sheet, no sideways scroll').toBe(true);
});
