// Adding things (S-021, S-022, S-024): the menu asks where, the place is preset and stays a field;
// the group guessed, no guessed date; a month outside the fridge and a day in it; the size's unit;
// one line for the same thing; "Brug snart"; search; undo.

import { expect, test } from '@playwright/test';
import { dayFromToday, openAdd, openApp, openSearch, pickMonth, seed, topSheet } from './fixtures.ts';

const WITH_FRIDGE = [
  { id: 'freezer', kind: 'freezer' as const },
  { id: 'pantry', kind: 'pantry' as const },
  { id: 'fridge', kind: 'fridge' as const },
];

test('Tilføj asks where, presets that place, and adds three things in a row, the group guessed and no date made up', async ({ page }) => {
  await openApp(page);
  await openAdd(page, 'Fryser');
  const sheet = topSheet(page);
  // Three places: buttons side by side, Fryser chosen.
  await expect(sheet.locator('fieldset', { hasText: 'Sted' }).locator('label')).toHaveText(['Fryser', 'Skabe', 'Viktualiekammer']);
  await expect(sheet.getByRole('radio', { name: 'Fryser' })).toBeChecked();
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
  await openAdd(page, 'Skabe');
  const sheet = topSheet(page);

  await expect(sheet.locator('input[type=date]')).toHaveCount(0);
  await page.locator('#add-name').fill('Havregryn');
  // Last month: past its date.
  const lastMonth = await page.evaluate(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    return { month: String(d.getMonth() + 1).padStart(2, '0'), year: String(d.getFullYear()) };
  });
  await pickMonth(page, 'add', lastMonth.year, lastMonth.month);
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
  await openAdd(page);
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

test('the same thing added twice is one line, with the count at the right', async ({ page }) => {
  await openApp(page);
  await openAdd(page, 'Skabe');
  const sheet = topSheet(page);
  for (const name of ['Baked beans', 'baked beans']) {
    await page.locator('#add-name').fill(name);
    await page.locator('#add-size').fill('415 g');
    await sheet.getByRole('button', { name: 'Tilføj', exact: true }).click();
  }
  await expect(sheet.getByText('Baked beans: nu 2')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('link', { name: /^Skabe/ }).click();
  await expect(page.locator('main li')).toHaveCount(1);
  const row = page.getByRole('button', { name: /^Baked beans/ });
  await expect(row).toContainText('415 g');
  await expect(row).toContainText('2 ting'); // read out; "2" is shown at the right
});

test('on a place\'s page Tilføj starts there without asking; on Hjem the last place is marked', async ({ page }) => {
  await openApp(page);
  await page.getByRole('link', { name: /^Viktualiekammer/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Viktualiekammer' })).toBeFocused(); // the new page is announced
  await openAdd(page);
  await expect(topSheet(page).getByRole('radio', { name: 'Viktualiekammer' })).toBeChecked();
  await page.locator('#add-name').fill('Mel');
  await page.locator('#add-name').press('Enter');
  await page.keyboard.press('Escape');
  await page.goto('./#/');
  await page.getByRole('navigation', { name: 'Handlinger' }).getByRole('button', { name: 'Tilføj' }).click();
  await expect(topSheet(page).getByRole('button', { name: /^Viktualiekammer/ })).toContainText('Sidst brugt');
});

test('Scan asks where, then scans into that place', async ({ page }) => {
  await openApp(page);
  await page.getByRole('navigation', { name: 'Handlinger' }).getByRole('button', { name: 'Scan' }).click();
  await topSheet(page).getByRole('button', { name: /^Viktualiekammer/ }).click();
  await expect(page).toHaveURL(/#\/scan\/larder$/);
  await page.getByRole('button', { name: /Uden stregkode|Skriv i stedet/ }).click();
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

test('Søg finds across places and opens a thing; a place\'s own search finds only there', async ({ page }) => {
  await openApp(page);
  await seed(page, {
    items: [
      { name: 'Letmælk', placeId: 'pantry', category: 'dairy' },
      { name: 'Mælkechokolade', placeId: 'larder', category: 'snacks' },
      { name: 'Kyllingebryst', placeId: 'freezer', category: 'meat' },
    ],
  });
  await openSearch(page);
  await page.getByRole('searchbox', { name: 'Søg i alt, du har' }).fill('mælk');
  // Grouped under their place, in the places' order, each place named first.
  const sheet = topSheet(page);
  await expect(sheet.getByRole('heading', { level: 3 })).toHaveText(['Skabe', 'Viktualiekammer']);
  await expect(sheet.getByRole('region', { name: 'Skabe' }).getByRole('listitem')).toHaveText([/Letmælk/]);
  await expect(sheet.getByRole('region', { name: 'Viktualiekammer' }).getByRole('listitem')).toHaveText([/Mælkechokolade/]);
  // The field spans the sheet's width.
  const widths = await sheet.evaluate((d) => ({ sheet: d.getBoundingClientRect().width, field: d.querySelector('#search-sheet-field')!.parentElement!.getBoundingClientRect().width }));
  expect(widths.field).toBeGreaterThan(widths.sheet - 40);
  const results = sheet.getByRole('listitem');
  await results.first().getByRole('button').click();
  await expect(topSheet(page).getByRole('heading', { name: 'Letmælk' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(results).toHaveCount(2); // back to the results
  await page.keyboard.press('Escape');

  await page.getByRole('link', { name: /^Skabe/ }).click();
  await page.getByRole('searchbox', { name: 'Søg i skabe' }).fill('mælk');
  await expect(page.locator('main li')).toHaveText([/Letmælk/]);
});

test('deleting a thing can be undone', async ({ page }) => {
  await openApp(page);
  await seed(page, { items: [{ name: 'Rugbrød', placeId: 'pantry', category: 'bread', count: 2 }] });
  await page.getByRole('link', { name: /^Skabe/ }).click();
  await page.getByRole('button', { name: /^Rugbrød/ }).click();
  await topSheet(page).getByRole('button', { name: 'Slet', exact: true }).click();
  await expect(page.locator('main li')).toHaveCount(0);
  await page.getByRole('button', { name: 'Fortryd' }).click();
  await expect(page.getByRole('button', { name: /^Rugbrød/ })).toContainText('2 ting');
});
