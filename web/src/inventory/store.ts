// The inventory on this phone (S-006): kept in memory for the screens and written to IndexedDB
// ('spisekammer', stores 'items' and 'products'), so it survives closing the app and works without
// a network. Every change applies at once; the write follows. Slice 5 adds the outbox for sync.

import { openDB, type IDBPDatabase } from 'idb';
import { useSyncExternalStore } from 'react';
import { today } from '../i18n/format';
import type { PackageKind } from '../keeping/rules';
import { startingPlaces, type PlaceKind } from '../places';
import { readPreferences } from '../settings/preferences';
import type { Category } from './categories';
import * as m from './model';

const DB_NAME = 'spisekammer';
const DB_VERSION = 2; // 2: places (S-013)

let state: m.Inventory = m.EMPTY;
let loaded = false;
const listeners = new Set<() => void>();
let dbPromise: Promise<IDBPDatabase> | null = null;

function db(): Promise<IDBPDatabase> {
  dbPromise ??= openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('items')) database.createObjectStore('items', { keyPath: 'id' });
      if (!database.objectStoreNames.contains('products')) database.createObjectStore('products', { keyPath: 'barcode' });
      if (!database.objectStoreNames.contains('places')) database.createObjectStore('places', { keyPath: 'id' });
    },
  });
  return dbPromise;
}

function emit() {
  for (const l of listeners) l();
}

// Reads everything once, at start. Broken records are dropped (model.parseItem).
export async function loadInventory(): Promise<void> {
  try {
    const database = await db();
    const [items, products, places] = await Promise.all([database.getAll('items'), database.getAll('products'), database.getAll('places')]);
    const parsedItems = items.map(m.parseItem).filter((i): i is m.Item => i !== null);
    // The first start (or the first since S-013): the default places, keeping every thing placed.
    const start = startingPlaces(
      places.map(m.parsePlace).filter((p): p is NonNullable<typeof p> => p !== null),
      parsedItems.map((i) => i.placeId),
      readPreferences().fridge,
    );
    state = {
      items: parsedItems,
      products: Object.fromEntries(products.map(m.parseProduct).filter((p): p is m.Product => p !== null).map((p) => [p.barcode, p])),
      places: start.places,
    };
    if (start.added.length > 0) void write({ state, putPlaces: start.added });
  } catch (error) {
    console.error('Inventory could not be read', error); // private mode or blocked storage: start empty
    state = { ...m.EMPTY, places: startingPlaces([], [], false).places };
  }
  loaded = true;
  emit();
}

function apply(change: m.Change) {
  state = change.state;
  emit();
  void write(change);
}

async function write(change: m.Change) {
  if (!change.put && !change.remove && !change.putProducts && !change.putPlaces && !change.removePlaces) return;
  try {
    const database = await db();
    const tx = database.transaction(['items', 'products', 'places'], 'readwrite');
    for (const item of change.put ?? []) void tx.objectStore('items').put(item);
    for (const id of change.remove ?? []) void tx.objectStore('items').delete(id);
    for (const product of change.putProducts ?? []) void tx.objectStore('products').put(product);
    for (const place of change.putPlaces ?? []) void tx.objectStore('places').put(place);
    for (const id of change.removePlaces ?? []) void tx.objectStore('places').delete(id);
    await tx.done;
  } catch (error) {
    console.error('Inventory could not be saved', error);
  }
}

export const inventory = {
  get: () => state,
  add: (item: m.NewItem) => {
    const id = crypto.randomUUID();
    apply(m.addItem(state, item, id, today(), Date.now()));
    return id;
  },
  setCount: (id: string, count: number) => apply(m.setCount(state, id, count, Date.now())),
  move: (id: string, placeId: string) => apply(m.moveItem(state, id, placeId, today(), Date.now())),
  addPlace: (name: string, kind: PlaceKind, presetId?: string) => {
    const id = presetId ?? crypto.randomUUID();
    apply(m.addPlace(state, { id, name, kind }, Date.now()));
    return id;
  },
  updatePlace: (id: string, change: { name?: string; kind?: PlaceKind }) => apply(m.updatePlace(state, id, change, Date.now())),
  removePlace: (id: string, moveTo: string | null) => apply(m.removePlace(state, id, moveTo, today(), Date.now())),
  setOpened: (id: string, opened: boolean) => apply(m.setOpened(state, id, opened ? today() : null, Date.now())),
  setPackageDate: (id: string, date: { day: string; kind: PackageKind } | null) => apply(m.setPackageDate(state, id, date, Date.now())),
  setType: (id: string, typeId: string | null, category: Category) => apply(m.setType(state, id, typeId, category, Date.now())),
  remove: (id: string) => apply(m.removeItem(state, id)),
  rememberProduct: (product: m.Product) => apply(m.rememberProduct(state, product)),
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useInventory(): m.Inventory {
  return useSyncExternalStore(subscribe, () => state);
}

export function useInventoryLoaded(): boolean {
  return useSyncExternalStore(subscribe, () => loaded);
}
