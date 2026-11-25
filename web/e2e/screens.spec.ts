// Every screen at phone size (S-019): nothing spills sideways, everything is easy to tap, and the
// fields are one height.

import { expect, test } from '@playwright/test';
import { openAdd, openApp, seed, topSheet } from './fixtures.ts';
import { expectEqualFields, expectNoSideScroll, expectTapTargets } from './layout.ts';

const SCREENS: [string, string, RegExp][] = [
  ['Hjem', '#/', /Hvad har du\?/],
  ['a place', '#/place/pantry', /Skabe/],
  ['Steder', '#/places', /Steder/],
  ['Indstillinger', '#/settings', /Indstillinger/],
  ['Del', '#/household', /Del/],
];

for (const [label, hash, heading] of SCREENS) {
  test(`${label}: no sideways scroll, tap targets big enough`, async ({ page }) => {
    await openApp(page);
    await seed(page, { items: [{ name: 'Letmælk med et meget langt navn, som skal kunne brydes pænt', placeId: 'pantry', category: 'dairy' }] });
    await page.goto(`./${hash}`);
    await expect(page.getByRole('heading', { level: 1, name: heading }).first()).toBeVisible();
    await expectNoSideScroll(page);
    await expectTapTargets(page.locator('body'));
  });
}

test('the add form and a thing\'s sheet: fields one height, targets big enough', async ({ page }) => {
  await openApp(page);
  await seed(page, { items: [{ name: 'Letmælk', placeId: 'pantry', category: 'dairy', date: '2030-05-31', datePrecision: 'month' }] });

  await openAdd(page, 'Skabe');
  await page.locator('#add-name').fill('Pasta');
  await topSheet(page).getByRole('button', { name: 'Skift' }).click();
  await expectEqualFields(topSheet(page));
  await expectTapTargets(topSheet(page));
  await page.keyboard.press('Escape');

  await page.getByRole('link', { name: /^Skabe/ }).click();
  await page.getByRole('button', { name: /^Letmælk/ }).click();
  await expectEqualFields(topSheet(page));
  await expectTapTargets(topSheet(page));
});

test('the menu is on Hjem and a place, not on Steder or Indstillinger', async ({ page }) => {
  await openApp(page);
  const nav = page.getByRole('navigation', { name: 'Handlinger' });
  await expect(nav.getByRole('button')).toHaveText(['', '', '']);
  await expect(nav.getByRole('button', { name: 'Scan' })).toBeVisible();
  for (const [hash, shown] of [['#/place/pantry', true], ['#/places', false], ['#/settings', false]] as const) {
    await page.goto(`./${hash}`);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(nav).toHaveCount(shown ? 1 : 0);
  }
});
