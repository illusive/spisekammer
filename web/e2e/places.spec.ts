// Places (S-013, S-019, S-022): alphabetical until the user moves one, by dragging, by keyboard or
// with "Flyt op" / "Flyt ned", with no selector; "Sortér alfabetisk" goes back. Add, rename, change
// kind, delete with a move. A place choice is buttons up to three places, a dropdown above.

import { expect, test, type Page } from '@playwright/test';
import { openAdd, openApp, seed, topSheet } from './fixtures.ts';
import { expectSheetFits } from './layout.ts';

const PLACES = [
  { id: 'freezer', kind: 'freezer' as const },
  { id: 'pantry', kind: 'pantry' as const },
  { id: 'larder', kind: 'pantry' as const },
  { id: 'g', kind: 'freezer' as const, name: 'Garagen' },
  { id: 'a', kind: 'pantry' as const, name: 'Æbleskab' },
];

const homePlaces = (page: Page) => page.getByRole('region', { name: 'Steder' }).getByRole('list').getByRole('link');
const stederRows = (page: Page) => page.locator('main ul').first().locator('li');

test('places are alphabetical by default everywhere, and more than three are a dropdown', async ({ page }) => {
  await openApp(page);
  await seed(page, { places: PLACES, items: [{ name: 'Mælk', placeId: 'pantry' }] });
  const expected = [/^Fryser/, /^Garagen/, /^Skabe/, /^Viktualiekammer/, /^Æbleskab/];
  await expect(homePlaces(page)).toHaveText(expected);

  await page.getByRole('navigation', { name: 'Handlinger' }).getByRole('button', { name: 'Tilføj' }).click();
  await expect(topSheet(page).getByRole('list').getByRole('button')).toHaveText(expected);
  await page.keyboard.press('Escape');
  await openAdd(page, 'Fryser');
  await expect(topSheet(page).getByLabel('Sted', { exact: true }).locator('option')).toHaveText(['Fryser', 'Garagen', 'Skabe', 'Viktualiekammer', 'Æbleskab']);
  await page.keyboard.press('Escape');

  await page.getByRole('link', { name: /^Skabe/ }).click();
  await page.getByRole('button', { name: /^Mælk/ }).click();
  const moveTo = topSheet(page).getByLabel('Flyt til');
  await expect(moveTo.locator('option')).toHaveText(['Fryser', 'Garagen', 'Skabe', 'Viktualiekammer', 'Æbleskab']);
  await expect(moveTo).toHaveValue('pantry');
  await moveTo.selectOption({ label: 'Garagen' });
  await expect(page.getByText('Mælk er flyttet til garagen')).toBeVisible();
});

test('moving a place by keyboard makes the order your own: kept after a reload, used on Hjem, undone by "Sortér alfabetisk"', async ({ page }) => {
  await openApp(page, { hash: '#/places' });
  await seed(page, { places: PLACES });
  await expect(page.getByText('Egen', { exact: true })).toHaveCount(0); // no selector (S-022)
  await expect(page.getByRole('button', { name: 'Sortér alfabetisk' })).toHaveCount(0);
  await expect(stederRows(page)).toHaveText([/Fryser/, /Garagen/, /Skabe/, /Viktualiekammer/, /Æbleskab/]);

  // Æbleskab to the top: pick it up, four steps up, drop. Like a keyboard user, each step waits for
  // the screen reader's announcement of where the place is now (a key pressed while the list is
  // still moving would be lost, which also checks the announcements).
  const live = page.locator('[id^="DndLiveRegion"]');
  const handle = page.getByRole('button', { name: 'Flyt Æbleskab' });
  await handle.focus();
  await page.keyboard.press('Space');
  await expect(live).toContainText('Æbleskab er taget op. Plads 5 af 5.');
  // The keyboard sensor listens once the drag has started (the handle is pressed); a moment more,
  // as a person would take.
  await expect(handle).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(150);
  for (let position = 4; position >= 1; position--) {
    await page.keyboard.press('ArrowUp');
    await expect(live).toContainText(`Æbleskab er over plads ${position} af 5.`);
  }
  await page.keyboard.press('Space');
  await expect(live).toContainText('Æbleskab er sat på plads 1 af 5.');
  await expect(stederRows(page)).toHaveText([/Æbleskab/, /Fryser/, /Garagen/, /Skabe/, /Viktualiekammer/]);

  await page.reload();
  await expect(stederRows(page)).toHaveText([/Æbleskab/, /Fryser/, /Garagen/, /Skabe/, /Viktualiekammer/]);
  await page.goto('./#/');
  await expect(homePlaces(page)).toHaveText([/^Æbleskab/, /^Fryser/, /^Garagen/, /^Skabe/, /^Viktualiekammer/]);

  await page.goto('./#/places');
  await page.getByRole('button', { name: 'Sortér alfabetisk' }).click();
  await expect(stederRows(page)).toHaveText([/Fryser/, /Garagen/, /Skabe/, /Viktualiekammer/, /Æbleskab/]);
  await expect(page.getByRole('button', { name: 'Sortér alfabetisk' })).toHaveCount(0);
});

test('an own order by dragging the handle', async ({ page, browserName }) => {
  await openApp(page, { hash: '#/places' });
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
    for (let i = 1; i <= 12; i++) {
      await touch('touchMove', y + ((toY - y) * i) / 12);
      await page.waitForTimeout(25);
    }
    await page.waitForTimeout(300);
    await touch('touchEnd', toY);
  } else {
    // WebKit here cannot make touch events; the mouse goes through the same sorting. Moved in
    // steps, like a hand, and let go once the list has settled.
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let i = 1; i <= 12; i++) {
      await page.mouse.move(x, y + ((toY - y) * i) / 12);
      await page.waitForTimeout(25);
    }
    await page.waitForTimeout(300);
    await page.mouse.up();
  }
  await expect(stederRows(page).first()).toHaveText(/Æbleskab/);
  await expect(page.getByRole('button', { name: 'Sortér alfabetisk' })).toBeVisible();
});

test('"Flyt op" and "Flyt ned" in a place\'s sheet, from the alphabetical order', async ({ page }) => {
  await openApp(page, { hash: '#/places' });
  await seed(page, { places: PLACES });
  await stederRows(page).filter({ hasText: 'Skabe' }).getByRole('button', { name: /^Skabe/ }).click();
  await expectSheetFits(page);
  // Skabe is third (Fryser, Garagen, Skabe …): two steps up make it first, and "Flyt op" greys out.
  await topSheet(page).getByRole('button', { name: 'Flyt op' }).click();
  await topSheet(page).getByRole('button', { name: 'Flyt op' }).click();
  await expect(topSheet(page).getByRole('button', { name: 'Flyt op' })).toBeDisabled();
  await topSheet(page).getByRole('button', { name: 'Flyt ned' }).click();
  await page.keyboard.press('Escape');
  await expect(stederRows(page)).toHaveText([/Fryser/, /Skabe/, /Garagen/, /Viktualiekammer/, /Æbleskab/]);
});

test('add, rename and change the kind of a place, and delete one with a move', async ({ page }) => {
  await openApp(page, { hash: '#/places' });
  await seed(page, { places: PLACES, items: [{ name: 'Is', placeId: 'g', category: 'snacks' }] });

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
  await topSheet(page).getByRole('button', { name: 'Slet', exact: true }).click();
  await expect(topSheet(page).getByText('Der er 1 ting i. Hvor skal den hen?')).toBeVisible();
  await topSheet(page).getByLabel('Flyt til').selectOption({ label: 'Fryser' });
  await topSheet(page).getByRole('button', { name: 'Flyt og slet' }).click();
  await expect(stederRows(page).filter({ hasText: 'Garagen' })).toHaveCount(0);
  await expect(stederRows(page).filter({ hasText: /^Fryser/ })).toContainText('1 ting');
});

test('"Rediger" by Steder on Hjem opens Steder', async ({ page }) => {
  await openApp(page);
  await page.getByRole('link', { name: 'Rediger steder' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Steder' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tilføj sted' })).toBeVisible();
});
