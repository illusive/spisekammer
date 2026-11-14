// The reported sheet bugs (S-016–S-019): the sheet must sit inside the screen, keep its header,
// scroll its content, put the cursor only where typing is expected, and leave the page scrollable
// once it is closed.

import { expect, test } from '@playwright/test';
import { manyItems, openApp, seed, topSheet } from './fixtures.ts';
import { expectHeaderStays, expectPageScrolls, expectSheetFits } from './layout.ts';

async function openAddSheet(page: import('@playwright/test').Page, place = 'Skabe') {
  await page.getByRole('button', { name: 'Tilføj', exact: true }).click();
  await expect(topSheet(page).getByRole('heading', { name: 'Hvor skal tingene hen?' })).toBeVisible();
  await topSheet(page).getByRole('button', { name: new RegExp(`^${place}`) }).click();
  await expect(topSheet(page).getByRole('heading', { name: `Tilføj i ${place.toLowerCase()}` })).toBeVisible();
}

test('the add sheet fits the screen, keeps its header, and puts the cursor in the name', async ({ page }, testInfo) => {
  await openApp(page);
  await openAddSheet(page);
  await expectSheetFits(page);
  await testInfo.attach('add sheet, full height', { body: await page.screenshot(), contentType: 'image/png' });
  await expect(page.locator('#add-name')).toBeFocused();
  await expectHeaderStays(page);
});

test('the add sheet fits a short screen too', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 480 });
  await openApp(page);
  await openAddSheet(page);
  await expectSheetFits(page);
  await testInfo.attach('add sheet, 480 px high', { body: await page.screenshot(), contentType: 'image/png' });
  await expectHeaderStays(page);
});

test('the page scrolls again after a sheet is closed (X, Escape, and after adding)', async ({ page }) => {
  await openApp(page);
  await seed(page, { items: manyItems(30, 'pantry') });

  await openAddSheet(page);
  await topSheet(page).getByRole('button', { name: 'Luk' }).click();
  await expectPageScrolls(page);

  await openAddSheet(page);
  await page.locator('#add-name').fill('Pasta');
  await page.locator('#add-name').press('Enter');
  await expect(topSheet(page).getByText('Pasta er tilføjet i skabe')).toBeVisible();
  await page.keyboard.press('Escape');
  await expectPageScrolls(page);

  await page.getByRole('link', { name: /^Skabe/ }).click();
  await page.getByRole('button', { name: /^Ting 01/ }).click();
  await expect(topSheet(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expectPageScrolls(page);
});

test('opening a thing starts on its title, with no field focused', async ({ page }) => {
  await openApp(page);
  await seed(page, { items: [{ name: 'Mælk', placeId: 'pantry', category: 'dairy' }] });
  await page.getByRole('link', { name: /^Skabe/ }).click();
  await page.getByRole('button', { name: /^Mælk/ }).click();
  await expectSheetFits(page);
  await expect(topSheet(page).getByRole('heading', { name: 'Mælk' })).toBeFocused();
});
