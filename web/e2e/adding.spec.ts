// Adding things (S-010, S-015, S-021, S-022): the place as a field, the group guessed, no guessed
// date; a month outside the fridge and a day in it; the size's unit; one line for the same thing;
// "Brug snart"; search.

import { expect, test } from '@playwright/test';
import { dayFromToday, openApp, seed, topSheet } from './fixtures.ts';

const WITH_FRIDGE = [
  { id: 'freezer', kind: 'freezer' as const },
  { id: 'pantry', kind: 'pantry' as const },
  { id: 'fridge', kind: 'fridge' as const },
];

test('adds three things in a row to one place, the group guessed and no date made up', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: 'Tilføj', exact: true }).click();
  const sheet = topSheet(page);
  await expect(sheet.getByRole('heading', { name: 'Tilføj' })).toBeVisible();
  // Three places: buttons side by side.
  await expect(sheet.locator('fieldset', { hasText: 'Sted' }).locator('label')).toHaveText(['Fryser', 'Skabe', 'Viktualiekammer']);
  await sheet.locator('label', { hasText: 'Fryser' }).click();
  const name = page.locator('#add-name');

  await name.fill('Hakket oksekød 8-12%');
  await expect(sheet.getByText('Slags:')).toContainText('Kød og fjerkræ');
  await expect(sheet.getByText(/Brug senest|Dato:/)).toHaveCount(0);
  await name.press('Enter');
  await expect(name).toHaveValue('');
  await expect(name).toBeFocused();

  await name.fill('Kyllingebryst');
  await name.press('Enter');
  await name.fill('frosne ærter');
  await name.press('Enter');
  await page.keyboard.press('Escape');

  await page.getByRole('link', { name: /^Fryser/ }).click();
  await expect(page.locator('main li')).toHaveCount(3);
  await expect(page.getByRole('button', { name: /^Frosne ærter/ })).toBeVisible(); // a capital first letter
  await expect(page.locator('main')).not.toContainText('Dato:');
});

test('a month and a year in Skabe, a day in Køleskab; near and past dates come up in "Brug snart"', async ({ page }) => {
  await openApp(page);
  await seed(page, { places: WITH_FRIDGE });
  await page.getByRole('button', { name: 'Tilføj', exact: true }).click();
  const sheet = topSheet(page);

  await sheet.locator('label', { hasText: 'Skabe' }).click();
  await expect(sheet.locator('input[type=date]')).toHaveCount(0);
  await page.locator('#add-name').fill('Havregryn');
  // Last month: past its date.
  const lastMonth = await page.evaluate(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    return { month: String(d.getMonth() + 1).padStart(2, '0'), year: String(d.getFullYear()) };
  });
  await page.locator('#add-month').selectOption(lastMonth.month);
  await page.locator('#add-year').selectOption(lastMonth.year);
  await sheet.getByRole('button', { name: 'Tilføj', exact: true }).click();

  await sheet.locator('label', { hasText: 'Køleskab' }).click();
  await expect(page.locator('#add-month')).toHaveCount(0);
  await page.locator('#add-name').fill('Letmælk');
  await page.locator('#add-date').fill(await dayFromToday(page, 2));
  await sheet.getByRole('button', { name: 'Tilføj', exact: true }).click();
  await page.keyboard.press('Escape');

  const soon = page.getByRole('region', { name: 'Brug snart' });
  await expect(soon.getByRole('button', { name: /^Letmælk/ })).toContainText(/Dato: .* \(om 2 dage\)/);
  await expect(soon.getByRole('button', { name: /^Havregryn/ })).toContainText(/Dato: \S+ \d{4}/);

  await soon.getByRole('button', { name: /^Havregryn/ }).click();
  await expect(topSheet(page).getByRole('note')).toHaveText(/Datoen er overskredet/);
});

test('a unit typed with the number moves to the unit dropdown', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: 'Tilføj', exact: true }).click();
  const size = page.locator('#add-size');
  const unit = topSheet(page).getByLabel('Enhed');
  await size.fill('500 g');
  await expect(size).toHaveValue('500');
  await expect(unit).toHaveValue('g');
  await size.fill('2 dåser');
  await expect(size).toHaveValue('2');
  await expect(unit).toHaveValue('dåse');
  await unit.selectOption('kg');
  await expect(size).toHaveValue('2');
});

test('the same thing added twice is one line with the count added up', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: 'Tilføj', exact: true }).click();
  const sheet = topSheet(page);
  await sheet.locator('label', { hasText: 'Skabe' }).click();
  for (const name of ['Baked beans', 'baked beans']) {
    await page.locator('#add-name').fill(name);
    await page.locator('#add-size').fill('415 g');
    await sheet.getByRole('button', { name: 'Tilføj', exact: true }).click();
  }
  await expect(sheet.getByText('Baked beans: nu 2')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('link', { name: /^Skabe/ }).click();
  await expect(page.locator('main li')).toHaveCount(1);
  await expect(page.getByRole('button', { name: /^Baked beans/ })).toContainText('2 ting · 415 g');
});

test('the add form starts on the place it was opened from, else the last one used', async ({ page }) => {
  await openApp(page);
  await page.getByRole('link', { name: /^Viktualiekammer/ }).click();
  await page.getByRole('button', { name: 'Tilføj', exact: true }).click();
  await expect(topSheet(page).getByRole('radio', { name: 'Viktualiekammer' })).toBeChecked();
  await page.locator('#add-name').fill('Mel');
  await page.locator('#add-name').press('Enter');
  await page.keyboard.press('Escape');
  await page.goto('./#/');
  await page.getByRole('button', { name: 'Tilføj', exact: true }).click();
  await expect(topSheet(page).getByRole('radio', { name: 'Viktualiekammer' })).toBeChecked();
});

test('things saved before S-021 open with their date and a group of the new list', async ({ page }) => {
  await openApp(page);
  await seed(page, {
    places: WITH_FRIDGE,
    items: [
      { name: 'kyllingebryst', placeId: 'freezer', category: 'poultry', extra: { typeId: 'fk-117', brand: 'Danpo', packageDate: '2030-05-01', packageKind: 'useBy' } },
      { name: 'Frosne ærter', placeId: 'freezer', category: 'frozen', extra: { openedOn: '2026-11-02' } },
    ],
  });
  await page.getByRole('link', { name: /^Fryser/ }).click();
  await expect(page.getByRole('region', { name: 'Kød og fjerkræ' }).getByRole('button', { name: /^Kyllingebryst/ })).toContainText('Dato: 1. maj 2030');
  await expect(page.getByRole('region', { name: 'Frugt og grønt' }).getByRole('button', { name: /^Frosne ærter/ })).toBeVisible();
});

test('search on Hjem finds across places; search in a place only there', async ({ page }) => {
  await openApp(page);
  await seed(page, {
    items: [
      { name: 'Letmælk', placeId: 'pantry', category: 'dairy' },
      { name: 'Mælkechokolade', placeId: 'larder', category: 'snacks' },
      { name: 'Kyllingebryst', placeId: 'freezer', category: 'meat' },
    ],
  });
  await page.getByRole('searchbox', { name: 'Søg i alt, du har' }).fill('mælk');
  await expect(page.locator('main section li')).toHaveText([/Letmælk/, /Mælkechokolade/]);

  await page.getByRole('searchbox').fill('');
  await page.getByRole('link', { name: /^Skabe/ }).click();
  await page.getByRole('searchbox', { name: 'Søg i skabe' }).fill('mælk');
  await expect(page.locator('main li')).toHaveText([/Letmælk/]);
});
