// Places (S-013, S-019): alphabetical by default; an own order by dragging, by keyboard, or with
// "Flyt op" / "Flyt ned"; add, rename, change kind, delete with a move.

import { expect, test, type Page } from '@playwright/test';
import { openApp, seed, topSheet } from './fixtures.ts';
import { expectSheetFits } from './layout.ts';

const PLACES = [
  { id: 'freezer', kind: 'freezer' as const },
  { id: 'pantry', kind: 'pantry' as const },
  { id: 'larder', kind: 'pantry' as const },
  { id: 'g', kind: 'freezer' as const, name: 'Garagen' },
  { id: 'a', kind: 'pantry' as const, name: 'Æbleskab' },
];

const homePlaces = (page: Page) => page.getByRole('region', { name: 'Steder' }).getByRole('link');
const stederRows = (page: Page) => page.locator('main ul').first().locator('li');

test('places are alphabetical by default everywhere', async ({ page }) => {
  await openApp(page);
  await seed(page, { places: PLACES, items: [{ name: 'Mælk', placeId: 'pantry' }] });
  const expected = [/^Fryser/, /^Garagen/, /^Skabe/, /^Viktualiekammer/, /^Æbleskab/];
  await expect(homePlaces(page)).toHaveText(expected);

  await page.getByRole('button', { name: 'Tilføj', exact: true }).click();
  await expect(topSheet(page).locator('li button')).toHaveText(expected);
  await page.keyboard.press('Escape');

  await page.getByRole('link', { name: /^Skabe/ }).click();
  await page.getByRole('button', { name: /^Mælk/ }).click();
  await expect(topSheet(page).locator('fieldset', { hasText: 'Flyt til' }).locator('label')).toHaveText(['Fryser', 'Garagen', 'Skabe', 'Viktualiekammer', 'Æbleskab']);
});

test('an own order, set by keyboard, kept after a reload and used on Hjem', async ({ page }) => {
  await openApp(page, { hash: '#/places' });
  await seed(page, { places: PLACES });
  await page.locator('label', { hasText: 'Egen' }).click();
  await expect(stederRows(page)).toHaveText([/Fryser/, /Garagen/, /Skabe/, /Viktualiekammer/, /Æbleskab/]);

  // Æbleskab to the top: pick it up, three... four steps up, drop.
  const handle = page.getByRole('button', { name: 'Flyt Æbleskab' });
  await handle.focus();
  await page.keyboard.press('Space');
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Space');
  await expect(stederRows(page)).toHaveText([/Æbleskab/, /Fryser/, /Garagen/, /Skabe/, /Viktualiekammer/]);

  await page.reload();
  await expect(stederRows(page)).toHaveText([/Æbleskab/, /Fryser/, /Garagen/, /Skabe/, /Viktualiekammer/]);
  await page.goto('./#/');
  await expect(homePlaces(page)).toHaveText([/^Æbleskab/, /^Fryser/, /^Garagen/, /^Skabe/, /^Viktualiekammer/]);
});

test('an own order by dragging the handle', async ({ page, browserName }) => {
  await openApp(page, { hash: '#/places', placeOrder: 'own' });
  await seed(page, { places: PLACES });
  const from = await page.getByRole('button', { name: 'Flyt Æbleskab' }).boundingBox();
  const to = await page.getByRole('button', { name: 'Flyt Fryser' }).boundingBox();
  if (!from || !to) throw new Error('no handles');
  const x = from.x + from.width / 2;
  const y = from.y + from.height / 2;
  const toY = to.y + to.height / 2 - 4;
  if (browserName === 'chromium') {
    // A real touch: hold on the handle (the touch sensor waits ~180 ms), then move, then lift.
    const cdp = await page.context().newCDPSession(page);
    const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', yy: number) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y: yy }] });
    await touch('touchStart', y);
    await page.waitForTimeout(300);
    for (let i = 1; i <= 12; i++) await touch('touchMove', y + ((toY - y) * i) / 12);
    await touch('touchEnd', toY);
  } else {
    // WebKit here cannot make touch events; the mouse goes through the same sorting.
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, toY, { steps: 12 });
    await page.mouse.up();
  }
  await expect(stederRows(page).first()).toHaveText(/Æbleskab/);
});

test('"Flyt op" and "Flyt ned" in a place\'s sheet', async ({ page }) => {
  await openApp(page, { hash: '#/places', placeOrder: 'own' });
  await seed(page, { places: PLACES });
  await stederRows(page).filter({ hasText: 'Skabe' }).getByRole('button', { name: /^Skabe/ }).click();
  await expectSheetFits(page);
  // Skabe is second: one step up makes it first, and "Flyt op" then greys out.
  await topSheet(page).getByRole('button', { name: 'Flyt op' }).click();
  await expect(topSheet(page).getByRole('button', { name: 'Flyt op' })).toBeDisabled();
  await topSheet(page).getByRole('button', { name: 'Flyt ned' }).click();
  await topSheet(page).getByRole('button', { name: 'Flyt ned' }).click();
  await page.keyboard.press('Escape');
  await expect(stederRows(page)).toHaveText([/Fryser/, /Viktualiekammer/, /Skabe/, /Garagen/, /Æbleskab/]);
});

test('add, rename and change the kind of a place, and delete one with a move', async ({ page }) => {
  await openApp(page, { hash: '#/places' });
  await seed(page, { places: PLACES, items: [{ name: 'Is', placeId: 'g', category: 'frozen' }] });

  await page.getByRole('button', { name: 'Tilføj sted' }).click();
  await topSheet(page).getByPlaceholder('Fx Fryser i garagen').fill('Kælder');
  await topSheet(page).locator('label', { hasText: 'Tørvarer' }).click();
  await topSheet(page).getByRole('button', { name: 'Tilføj sted' }).click();
  await expect(stederRows(page).filter({ hasText: 'Kælder' })).toContainText('Tørvarer');

  await stederRows(page).getByRole('button', { name: /^Kælder/ }).click();
  await topSheet(page).getByRole('textbox').fill('Kælderen');
  await topSheet(page).locator('label', { hasText: 'Køl' }).click();
  await topSheet(page).getByRole('button', { name: 'Gem' }).click();
  await expect(stederRows(page).filter({ hasText: 'Kælderen' })).toContainText('Køl');

  await stederRows(page).getByRole('button', { name: /^Garagen/ }).click();
  await topSheet(page).getByRole('button', { name: 'Slet sted' }).click();
  await expect(topSheet(page).getByText('Der er 1 ting i. Hvor skal den hen?')).toBeVisible();
  await topSheet(page).locator('fieldset', { hasText: 'Flyt til' }).locator('label', { hasText: 'Fryser' }).click();
  await topSheet(page).getByRole('button', { name: 'Flyt og slet' }).click();
  await expect(stederRows(page).filter({ hasText: 'Garagen' })).toHaveCount(0);
  await expect(stederRows(page).filter({ hasText: /^Fryser/ })).toContainText('1 ting');
});
