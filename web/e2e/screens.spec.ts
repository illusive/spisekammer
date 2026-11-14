// Every screen at phone size (S-019): nothing spills sideways, everything is easy to tap, and the
// fields are one height.

import { expect, test } from '@playwright/test';
import { openApp, seed, topSheet } from './fixtures.ts';
import { expectEqualFields, expectNoSideScroll, expectTapTargets } from './layout.ts';

const SCREENS: [string, string, RegExp][] = [
  ['Hjem', '#/', /Hvad har du\?/],
  ['a place', '#/place/pantry', /Skabe/],
  ['Steder', '#/places', /Steder/],
  ['Indstillinger', '#/settings', /Indstillinger/],
  ['Sådan regner appen', '#/rules', /Sådan regner appen/],
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
  await seed(page, { items: [{ name: 'Letmælk', placeId: 'pantry', category: 'dairy', typeId: 'fk-27' }] });

  await page.getByRole('button', { name: 'Tilføj', exact: true }).click();
  await topSheet(page).getByRole('button', { name: /^Skabe/ }).click();
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
