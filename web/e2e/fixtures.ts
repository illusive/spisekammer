// Starting the app for a test (S-019). Each test gets a fresh browser context, so IndexedDB and
// localStorage start empty; these helpers skip the first start, and put places and things in.

import { expect, type Page } from '@playwright/test';

export const PREFS_KEY = 'spisekammer.preferences.v1';

export interface StartOptions {
  onboarded?: boolean; // false: show the first start
  placeOrder?: 'alphabetical' | 'own';
  hash?: string;
}

// Opens the app. Unless `onboarded: false`, the first start is marked done before the app loads.
export async function openApp(page: Page, options: StartOptions = {}): Promise<void> {
  const { onboarded = true, placeOrder, hash = '#/' } = options;
  if (onboarded) {
    const prefs = JSON.stringify({ onboarded: true, ...(placeOrder ? { placeOrder } : {}) });
    // Only if not set yet, so what a test changes survives a reload.
    await page.addInitScript(([key, value]) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, value);
    }, [PREFS_KEY, prefs] as const);
  }
  await page.goto(`./${hash}`);
  await expect(page.locator('main, [role="main"], body > #root > *').first()).toBeVisible();
}

export interface SeedPlace {
  id: string;
  kind: 'freezer' | 'fridge' | 'pantry';
  name?: string;
  sort?: number;
}

export interface SeedItem {
  name: string;
  placeId: string;
  category?: string;
  count?: number;
  typeId?: string;
}

// Writes places and things straight into the app's IndexedDB, then reloads so the app reads them.
// Places replace the starting ones.
export async function seed(page: Page, data: { places?: SeedPlace[]; items?: SeedItem[] }): Promise<void> {
  await page.evaluate(async ({ places, items }) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('spisekammer');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const tx = db.transaction(['places', 'items'], 'readwrite');
    if (places) {
      tx.objectStore('places').clear();
      places.forEach((p, i) => tx.objectStore('places').put({ id: p.id, kind: p.kind, ...(p.name ? { name: p.name } : {}), sort: p.sort ?? i, updatedAt: 1 }));
    }
    (items ?? []).forEach((item, i) =>
      tx.objectStore('items').put({
        id: `seed-${i}`,
        name: item.name,
        category: item.category ?? 'other',
        placeId: item.placeId,
        count: item.count ?? 1,
        ...(item.typeId ? { typeId: item.typeId } : {}),
        addedOn: '2026-11-01',
        placedOn: '2026-11-01',
        updatedAt: 1,
      }),
    );
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }, data);
  await page.reload();
  await expect(page.locator('body')).toBeVisible();
}

// Many places and things, for the scrolling tests.
export function manyPlaces(n: number): SeedPlace[] {
  return Array.from({ length: n }, (_, i) => ({ id: `p${i}`, kind: (['freezer', 'pantry', 'fridge'] as const)[i % 3]!, name: `Sted ${String(i + 1).padStart(2, '0')}`, sort: n - i }));
}

export function manyItems(n: number, placeId: string): SeedItem[] {
  return Array.from({ length: n }, (_, i) => ({ name: `Ting ${String(i + 1).padStart(2, '0')}`, placeId, category: 'dry' }));
}

// The sheet on top (the last open dialog).
export const topSheet = (page: Page) => page.locator('dialog[open]').last();
