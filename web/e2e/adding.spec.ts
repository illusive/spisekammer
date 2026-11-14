// Adding things, the keeping line, "Brug snart" and search (S-010, S-015).

import { expect, test } from '@playwright/test';
import { openApp, seed, topSheet } from './fixtures.ts';

test('adds three things in a row to one place, with the kind guessed and a keep-by line', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: 'Tilføj', exact: true }).click();
  await topSheet(page).getByRole('button', { name: /^Fryser/ }).click();
  const name = page.locator('#add-name');

  await name.fill('Hakket oksekød 8-12%');
  await expect(topSheet(page).getByText('Slags:')).toContainText('Hakket oksekød');
  await expect(topSheet(page).getByText(/Brug senest ca\./)).toBeVisible();
  await name.press('Enter');
  await expect(name).toHaveValue('');
  await expect(name).toBeFocused();

  await name.fill('Kyllingebryst');
  await name.press('Enter');
  await name.fill('Frosne ærter');
  await name.press('Enter');
  await page.keyboard.press('Escape');

  await page.getByRole('link', { name: /^Fryser/ }).click();
  await expect(page.locator('main li')).toHaveCount(3);
  await expect(page.getByRole('button', { name: /Hakket oksekød/ })).toContainText('Brug senest ca.');
});

test('a package date shows first, and soon dates come up in "Brug snart"', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: 'Tilføj', exact: true }).click();
  await topSheet(page).getByRole('button', { name: /^Skabe/ }).click();
  await page.locator('#add-name').fill('Letmælk');
  const inTwoDays = await page.evaluate(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  await topSheet(page).locator('input[type=date]').fill(inTwoDays);
  await expect(topSheet(page).getByText(/Bedst før .* \(om 2 dage\)/)).toBeVisible();
  await topSheet(page).getByRole('button', { name: 'Tilføj', exact: true }).click();
  await page.keyboard.press('Escape');

  const soon = page.getByRole('region', { name: 'Brug snart' });
  await expect(soon.getByRole('button', { name: /^Letmælk/ })).toContainText('Bedst før');
});

test('search on Hjem finds across places; search in a place only there', async ({ page }) => {
  await openApp(page);
  await seed(page, {
    items: [
      { name: 'Letmælk', placeId: 'pantry', category: 'dairy' },
      { name: 'Mælkechokolade', placeId: 'larder', category: 'other' },
      { name: 'Kyllingebryst', placeId: 'freezer', category: 'poultry' },
    ],
  });
  await page.getByRole('searchbox', { name: 'Søg i alt, du har' }).fill('mælk');
  await expect(page.locator('main section li')).toHaveText([/Letmælk/, /Mælkechokolade/]);

  await page.getByRole('searchbox').fill('');
  await page.getByRole('link', { name: /^Skabe/ }).click();
  await page.getByRole('searchbox', { name: 'Søg i skabe' }).fill('mælk');
  await expect(page.locator('main li')).toHaveText([/Letmælk/]);
});
