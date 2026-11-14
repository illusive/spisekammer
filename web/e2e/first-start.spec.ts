// The first start (S-015): one step at a time, and only once.

import { expect, test } from '@playwright/test';
import { openApp } from './fixtures.ts';

test('sets up the places, then shows them on Hjem, alphabetically', async ({ page }) => {
  await openApp(page, { onboarded: false });
  await expect(page.getByRole('heading', { name: 'Hold styr på det, du har' })).toBeVisible();
  await page.getByRole('button', { name: 'Kom i gang' }).click();

  await expect(page.getByRole('heading', { name: 'Hvor har du ting?' })).toBeVisible();
  await page.getByRole('checkbox', { name: /Viktualiekammer/ }).uncheck({ force: true });
  await page.getByRole('checkbox', { name: /Køleskab/ }).check({ force: true });
  await page.getByPlaceholder('Fx Fryser i garagen').fill('Garagefryser');
  await page.getByRole('button', { name: 'Tilføj', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: /Garagefryser/ })).toBeChecked();
  await page.getByRole('button', { name: 'Næste' }).click();

  await expect(page.getByRole('heading', { name: 'Vil du dele med dem, du bor med?' })).toBeVisible();
  await page.getByRole('button', { name: 'Næste' }).click();
  await expect(page.getByRole('heading', { name: 'Du er klar' })).toBeVisible();
  await page.getByRole('button', { name: 'Start' }).click();

  const places = page.getByRole('region', { name: 'Steder' }).getByRole('link');
  await expect(places).toHaveText([/^Fryser/, /^Garagefryser/, /^Køleskab/, /^Skabe/]);

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Hvad har du?' })).toBeVisible();
});

test('"Spring over" keeps the starting places', async ({ page }) => {
  await openApp(page, { onboarded: false });
  await page.getByRole('button', { name: 'Spring over' }).click();
  await expect(page.getByRole('region', { name: 'Steder' }).getByRole('link')).toHaveText([/^Fryser/, /^Skabe/, /^Viktualiekammer/]);
});
