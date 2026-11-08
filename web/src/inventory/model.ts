// The household's inventory (S-006): the things, where they are, and barcodes remembered on this
// phone. Pure: the changes are functions from one state to the next, so they are tested without a
// browser; inventory/store.ts keeps the state and writes it to IndexedDB. The dates and the food
// type feed the keeping rules (keeping/rules.ts, S-010).

import type { PackageKind } from '../keeping/rules';
import { PLACE_KINDS, type Place, type PlaceKind } from '../places';
import { CATEGORIES, type Category } from './categories';
import { SIZE_UNITS, type SizeUnit } from './size';

export const MAX_COUNT = 999;

export interface Item {
  id: string;
  name: string;
  brand?: string;
  category: Category;
  placeId: string;
  count: number;
  amount?: number; // size as a number and a unit (from stead's D-050), e.g. 400 g
  unit?: SizeUnit;
  sizeText?: string; // a size that is not a number and a unit
  barcode?: string;
  typeId?: string; // a food type (keeping/foodTypes.ts), e.g. fk-43
  addedOn: string; // yyyy-mm-dd
  placedOn: string; // the day it came into its place: the keeping clock starts here
  openedOn?: string;
  thawedOn?: string; // the day it came out of the freezer into the fridge
  packageDate?: string; // the date printed on the package
  packageKind?: PackageKind; // "sidste anvendelsesdato" (useBy) or "bedst før" (bestBefore)
  updatedAt: number; // ms; the last change (sync in slice 5 compares it)
}

// What a barcode stands for, remembered on this phone after a lookup or typed once.
export interface Product {
  barcode: string;
  name: string;
  brand?: string;
  quantity?: string;
  category?: Category;
}

export interface Inventory {
  items: Item[];
  products: Record<string, Product>;
  places: Place[]; // the household's places (S-013)
}

export const EMPTY: Inventory = { items: [], products: {}, places: [] };

const str = (x: unknown, max = 120): string | undefined => (typeof x === 'string' && x.trim() ? x.trim().slice(0, max) : undefined);
const isDay = (x: unknown): x is string => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x);

// Anything read back from storage is checked; a broken record is dropped, never shown half.
export function parseItem(x: unknown): Item | null {
  if (typeof x !== 'object' || x === null) return null;
  const r = x as Record<string, unknown>;
  const id = str(r.id, 64);
  const name = str(r.name);
  const placeId = str(r.placeId, 64);
  if (!id || !name || !placeId) return null;
  const category = CATEGORIES.find((c) => c === r.category) ?? 'other';
  const count = typeof r.count === 'number' && Number.isFinite(r.count) ? Math.min(MAX_COUNT, Math.max(1, Math.round(r.count))) : 1;
  const addedOn = isDay(r.addedOn) ? r.addedOn : '1970-01-01';
  const item: Item = { id, name, category, placeId, count, addedOn, placedOn: isDay(r.placedOn) ? r.placedOn : addedOn, updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : 0 };
  if (typeof r.typeId === 'string' && /^fk-\d{1,4}$/.test(r.typeId)) item.typeId = r.typeId;
  if (isDay(r.openedOn)) item.openedOn = r.openedOn;
  if (isDay(r.thawedOn)) item.thawedOn = r.thawedOn;
  if (isDay(r.packageDate) && (r.packageKind === 'useBy' || r.packageKind === 'bestBefore')) {
    item.packageDate = r.packageDate;
    item.packageKind = r.packageKind;
  }
  const brand = str(r.brand);
  if (brand) item.brand = brand;
  const unit = SIZE_UNITS.find((u) => u === r.unit);
  if (typeof r.amount === 'number' && r.amount > 0 && unit) {
    item.amount = r.amount;
    item.unit = unit;
  } else {
    const sizeText = str(r.sizeText, 40);
    if (sizeText) item.sizeText = sizeText;
  }
  const barcode = str(r.barcode, 14);
  if (barcode && /^\d{8,14}$/.test(barcode)) item.barcode = barcode;
  return item;
}

export function parsePlace(x: unknown): Place | null {
  if (typeof x !== 'object' || x === null) return null;
  const r = x as Record<string, unknown>;
  const id = str(r.id, 64);
  const kind = PLACE_KINDS.find((k) => k === r.kind);
  if (!id || !kind) return null;
  const place: Place = { id, kind, sort: typeof r.sort === 'number' && Number.isFinite(r.sort) ? r.sort : 0, updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : 0 };
  const name = str(r.name, 40);
  if (name) place.name = name;
  return place;
}

export function parseProduct(x: unknown): Product | null {
  if (typeof x !== 'object' || x === null) return null;
  const r = x as Record<string, unknown>;
  const barcode = str(r.barcode, 14);
  const name = str(r.name);
  if (!barcode || !/^\d{8,14}$/.test(barcode) || !name) return null;
  const product: Product = { barcode, name };
  const brand = str(r.brand);
  if (brand) product.brand = brand;
  const quantity = str(r.quantity, 40);
  if (quantity) product.quantity = quantity;
  const category = CATEGORIES.find((c) => c === r.category);
  if (category) product.category = category;
  return product;
}

export type NewItem = Omit<Item, 'id' | 'addedOn' | 'placedOn' | 'updatedAt'>;

// The changes. Each returns the new state and the records to write (put) or delete.
export type Change = { state: Inventory; put?: Item[]; remove?: string[]; putProducts?: Product[]; putPlaces?: Place[]; removePlaces?: string[] };

export function addItem(state: Inventory, item: NewItem, id: string, today: string, now: number): Change {
  const saved: Item = { ...item, count: clampCount(item.count), id, addedOn: today, placedOn: today, updatedAt: now };
  return { state: { ...state, items: [...state.items, saved] }, put: [saved] };
}

// Count 0 removes the thing (taking out the last one).
export function setCount(state: Inventory, id: string, count: number, now: number): Change {
  const item = state.items.find((i) => i.id === id);
  if (!item) return { state };
  if (count <= 0) return removeItem(state, id);
  const next = { ...item, count: clampCount(count), updatedAt: now };
  return { state: { ...state, items: state.items.map((i) => (i.id === id ? next : i)) }, put: [next] };
}

// A move starts the place's clock again. Out of the freezer into the fridge, it is thawing (S-010).
export function moveItem(state: Inventory, id: string, placeId: string, today: string, now: number): Change {
  const item = state.items.find((i) => i.id === id);
  if (!item || item.placeId === placeId) return { state };
  return replace(state, moved(state.places, item, placeId, today, now));
}

function moved(places: Place[], item: Item, placeId: string, today: string, now: number): Item {
  const kindOf = (pid: string): PlaceKind | undefined => places.find((p) => p.id === pid)?.kind;
  const thawing = kindOf(item.placeId) === 'freezer' && kindOf(placeId) === 'fridge';
  const { thawedOn: _, ...rest } = item;
  return { ...rest, placeId, placedOn: today, ...(thawing ? { thawedOn: today } : {}), updatedAt: now };
}

// --- Places (S-013)

export const MAX_PLACE_NAME = 40;

export function addPlace(state: Inventory, place: { id: string; name: string; kind: PlaceKind }, now: number): Change {
  const sort = Math.max(-1, ...state.places.map((p) => p.sort)) + 1;
  const saved: Place = { id: place.id, kind: place.kind, name: place.name.trim().slice(0, MAX_PLACE_NAME), sort, updatedAt: now };
  return { state: { ...state, places: [...state.places, saved] }, putPlaces: [saved] };
}

// A new name (empty: the preset's own name again) or kind. A new kind changes the keeping times
// of what is in it, from the day each thing came in.
export function updatePlace(state: Inventory, id: string, change: { name?: string; kind?: PlaceKind }, now: number): Change {
  const place = state.places.find((p) => p.id === id);
  if (!place) return { state };
  const { name: _, ...rest } = place;
  const name = change.name === undefined ? place.name : change.name.trim().slice(0, MAX_PLACE_NAME) || undefined;
  const next: Place = { ...rest, ...(name ? { name } : {}), kind: change.kind ?? place.kind, updatedAt: now };
  return { state: { ...state, places: state.places.map((p) => (p.id === id ? next : p)) }, putPlaces: [next] };
}

// Deleting a place moves its things to another place first; the last place cannot go.
export function removePlace(state: Inventory, id: string, moveTo: string | null, today: string, now: number): Change {
  if (!state.places.some((p) => p.id === id) || state.places.length <= 1) return { state };
  const inIt = state.items.filter((i) => i.placeId === id);
  if (inIt.length > 0 && (!moveTo || moveTo === id || !state.places.some((p) => p.id === moveTo))) return { state };
  const movedItems = inIt.map((i) => moved(state.places, i, moveTo!, today, now));
  const items = state.items.map((i) => movedItems.find((m) => m.id === i.id) ?? i);
  return { state: { ...state, items, places: state.places.filter((p) => p.id !== id) }, removePlaces: [id], ...(movedItems.length > 0 ? { put: movedItems } : {}) };
}

// Opened on a day, or not opened (null: undo).
export function setOpened(state: Inventory, id: string, day: string | null, now: number): Change {
  const item = state.items.find((i) => i.id === id);
  if (!item) return { state };
  const { openedOn: _, ...rest } = item;
  return replace(state, { ...rest, ...(day ? { openedOn: day } : {}), updatedAt: now });
}

// The date on the package, or none (null).
export function setPackageDate(state: Inventory, id: string, date: { day: string; kind: PackageKind } | null, now: number): Change {
  const item = state.items.find((i) => i.id === id);
  if (!item) return { state };
  const { packageDate: _d, packageKind: _k, ...rest } = item;
  return replace(state, { ...rest, ...(date ? { packageDate: date.day, packageKind: date.kind } : {}), updatedAt: now });
}

// What it is: a food type (which sets the category), or only a category.
export function setType(state: Inventory, id: string, typeId: string | null, category: Category, now: number): Change {
  const item = state.items.find((i) => i.id === id);
  if (!item) return { state };
  const { typeId: _, ...rest } = item;
  return replace(state, { ...rest, ...(typeId ? { typeId } : {}), category, updatedAt: now });
}

function replace(state: Inventory, next: Item): Change {
  return { state: { ...state, items: state.items.map((i) => (i.id === next.id ? next : i)) }, put: [next] };
}

export function removeItem(state: Inventory, id: string): Change {
  if (!state.items.some((i) => i.id === id)) return { state };
  return { state: { ...state, items: state.items.filter((i) => i.id !== id) }, remove: [id] };
}

export function rememberProduct(state: Inventory, product: Product): Change {
  return { state: { ...state, products: { ...state.products, [product.barcode]: product } }, putProducts: [product] };
}

const clampCount = (n: number) => Math.min(MAX_COUNT, Math.max(1, Math.round(n)));

// A scanned barcode the household already has: the things with it, in the order they were added.
export const withBarcode = (state: Inventory, barcode: string) => state.items.filter((i) => i.barcode === barcode);
