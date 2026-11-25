// The household's inventory (S-006): the things, where they are, and barcodes remembered on this
// phone. Pure: the changes are functions from one state to the next, so they are tested without a
// browser; inventory/store.ts keeps the state and writes it to IndexedDB. A thing has a date only
// when the user gives one (S-021).

import type { DatePrecision } from '../keeping/rules';
import { fold } from '../lib/fold';
import { tidyName } from '../lib/name';
import { PLACE_KINDS, type Place, type PlaceKind } from '../places';
import { isBarcode } from '../scan/barcode';
import { readCategory, type Category } from './categories';
import { parseSize, SIZE_UNITS, type Size, type SizeUnit } from './size';

export const MAX_COUNT = 999;

export interface Item {
  id: string;
  name: string;
  category: Category;
  placeId: string;
  count: number;
  amount?: number; // size as a number and a unit (from stead's D-050), e.g. 400 g
  unit?: SizeUnit;
  sizeText?: string; // a size that is not a number and a unit
  barcode?: string;
  addedOn: string; // yyyy-mm-dd
  placedOn: string; // the day it came into its place
  date?: string; // the user's date, yyyy-mm-dd; a month is stored as its last day (S-021)
  datePrecision?: DatePrecision; // with a date: given as a day, or as a month
  updatedAt: number; // ms; the last change (sync in slice 5 compares it)
}

// What a barcode stands for, remembered on this phone with what the user settled on when adding
// it (S-004, S-024): the name, the group and the size. Kept up to date when the thing's group or
// size is changed later.
export interface Product {
  barcode: string;
  name: string;
  category?: Category;
  amount?: number; // the size as a number and a unit
  unit?: SizeUnit;
  sizeText?: string; // a size that is not a number and a unit (a multipack: "6 x 1,5 l")
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
  const raw = str(r.name);
  const placeId = str(r.placeId, 64);
  if (!id || !raw || !placeId) return null;
  const name = tidyName(raw);
  const category = readCategory(r.category, name);
  const count = typeof r.count === 'number' && Number.isFinite(r.count) ? Math.min(MAX_COUNT, Math.max(1, Math.round(r.count))) : 1;
  const addedOn = isDay(r.addedOn) ? r.addedOn : '1970-01-01';
  const item: Item = { id, name, category, placeId, count, addedOn, placedOn: isDay(r.placedOn) ? r.placedOn : addedOn, updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : 0 };
  // Before S-021 the date was the package's, with a kind (best before / use by) that no longer counts.
  const date = isDay(r.date) ? r.date : isDay(r.packageDate) ? r.packageDate : undefined;
  if (date) {
    item.date = date;
    item.datePrecision = r.datePrecision === 'month' ? 'month' : 'day';
  }
  const unit = SIZE_UNITS.find((u) => u === r.unit);
  if (typeof r.amount === 'number' && r.amount > 0 && unit) {
    item.amount = r.amount;
    item.unit = unit;
  } else {
    const sizeText = str(r.sizeText, 40);
    if (sizeText) item.sizeText = sizeText;
  }
  const barcode = str(r.barcode, 14);
  if (barcode && isBarcode(barcode)) item.barcode = barcode;
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
  if (!barcode || !isBarcode(barcode) || !name) return null;
  const product: Product = { barcode, name: tidyName(name) };
  if (r.category !== undefined) product.category = readCategory(r.category, product.name);
  const unit = SIZE_UNITS.find((u) => u === r.unit);
  if (typeof r.amount === 'number' && r.amount > 0 && unit) return { ...product, amount: r.amount, unit };
  // Before S-024 the size was the lookup's text ("400 g"); read it as a size where it is one.
  const text = str(r.sizeText, 40) ?? str(r.quantity, 40);
  const read = text ? parseSize(text) : null;
  if (read && read.count === undefined) return { ...product, amount: read.amount, unit: read.unit };
  return text ? { ...product, sizeText: text } : product;
}

// A thing's memory under its barcode: its name, group and size.
export function productOf(item: Pick<Item, 'name' | 'category' | 'amount' | 'unit' | 'sizeText'> & { barcode: string }): Product {
  return {
    barcode: item.barcode,
    name: item.name,
    category: item.category,
    ...(item.amount && item.unit ? { amount: item.amount, unit: item.unit } : item.sizeText ? { sizeText: item.sizeText } : {}),
  };
}

export type NewItem = Omit<Item, 'id' | 'addedOn' | 'placedOn' | 'updatedAt'>;

// The changes. Each returns the new state and the records to write (put) or delete.
export type Change = { state: Inventory; put?: Item[]; remove?: string[]; putProducts?: Product[]; putPlaces?: Place[]; removePlaces?: string[] };

// The same thing in the same place (name, ignoring case and accents, and size): one line.
export function sameThing(state: Inventory, item: Pick<Item, 'name' | 'placeId' | 'amount' | 'unit' | 'sizeText'>): Item | undefined {
  const name = fold(item.name.trim());
  return state.items.find((i) => i.placeId === item.placeId && fold(i.name) === name && i.amount === item.amount && i.unit === item.unit && i.sizeText === item.sizeText);
}

// A new thing, or more of one already there (S-022): then the count goes up, and the earlier date
// stays, so "Brug snart" still sees the oldest.
export function addItem(state: Inventory, item: NewItem, id: string, today: string, now: number): Change & { id: string; merged: boolean } {
  const name = tidyName(item.name);
  const existing = sameThing(state, { ...item, name });
  if (existing) {
    const earlier = item.date !== undefined && (existing.date === undefined || item.date < existing.date);
    const { date: _d, datePrecision: _p, ...rest } = existing;
    const date = earlier ? { date: item.date!, datePrecision: item.datePrecision ?? 'day' } : existing.date ? { date: existing.date, datePrecision: existing.datePrecision ?? 'day' } : {};
    // The barcode stays with the line, so the next scan finds it (S-024).
    const barcode = existing.barcode ?? item.barcode;
    const next: Item = { ...rest, ...date, ...(barcode ? { barcode } : {}), count: clampCount(existing.count + item.count), updatedAt: now };
    return { ...replace(state, next), id: existing.id, merged: true };
  }
  const saved: Item = { ...item, name, count: clampCount(item.count), id, addedOn: today, placedOn: today, updatedAt: now };
  return { state: { ...state, items: [...state.items, saved] }, put: [saved], id, merged: false };
}

// Count 0 removes the thing (taking out the last one).
export function setCount(state: Inventory, id: string, count: number, now: number): Change {
  const item = state.items.find((i) => i.id === id);
  if (!item) return { state };
  if (count <= 0) return removeItem(state, id);
  const next = { ...item, count: clampCount(count), updatedAt: now };
  return { state: { ...state, items: state.items.map((i) => (i.id === id ? next : i)) }, put: [next] };
}

// A move to another place. The date stays as it was given (S-021).
export function moveItem(state: Inventory, id: string, placeId: string, today: string, now: number): Change {
  const item = state.items.find((i) => i.id === id);
  if (!item || item.placeId === placeId) return { state };
  return replace(state, moved(item, placeId, today, now));
}

function moved(item: Item, placeId: string, today: string, now: number): Item {
  return { ...item, placeId, placedOn: today, updatedAt: now };
}

// --- Places (S-013)

export const MAX_PLACE_NAME = 40;

export function addPlace(state: Inventory, place: { id: string; name: string; kind: PlaceKind }, now: number): Change {
  const sort = Math.max(-1, ...state.places.map((p) => p.sort)) + 1;
  const name = place.name.trim().slice(0, MAX_PLACE_NAME);
  // No name: a preset (Fryser, Køleskab …) shows its own name in the user's language.
  const saved: Place = { id: place.id, kind: place.kind, ...(name ? { name } : {}), sort, updatedAt: now };
  return { state: { ...state, places: [...state.places, saved] }, putPlaces: [saved] };
}

// A new name (empty: the preset's own name again) or kind.
export function updatePlace(state: Inventory, id: string, change: { name?: string; kind?: PlaceKind }, now: number): Change {
  const place = state.places.find((p) => p.id === id);
  if (!place) return { state };
  const { name: _, ...rest } = place;
  const name = change.name === undefined ? place.name : change.name.trim().slice(0, MAX_PLACE_NAME) || undefined;
  const next: Place = { ...rest, ...(name ? { name } : {}), kind: change.kind ?? place.kind, updatedAt: now };
  return { state: { ...state, places: state.places.map((p) => (p.id === id ? next : p)) }, putPlaces: [next] };
}

// The user's own order (S-019): the places in `orderedIds` get sort 0, 1, 2 …; those not listed
// keep theirs, after them. Only places whose sort changes are written.
export function reorderPlaces(state: Inventory, orderedIds: string[], now: number): Change {
  const position = new Map(orderedIds.map((id, i) => [id, i]));
  const changed: Place[] = [];
  const places = state.places.map((p) => {
    const sort = position.get(p.id) ?? orderedIds.length + p.sort;
    if (sort === p.sort) return p;
    const next = { ...p, sort, updatedAt: now };
    changed.push(next);
    return next;
  });
  return changed.length === 0 ? { state } : { state: { ...state, places }, putPlaces: changed };
}

// Deleting a place moves its things to another place first; the last place cannot go.
export function removePlace(state: Inventory, id: string, moveTo: string | null, today: string, now: number): Change {
  if (!state.places.some((p) => p.id === id) || state.places.length <= 1) return { state };
  const inIt = state.items.filter((i) => i.placeId === id);
  if (inIt.length > 0 && (!moveTo || moveTo === id || !state.places.some((p) => p.id === moveTo))) return { state };
  const movedItems = inIt.map((i) => moved(i, moveTo!, today, now));
  const items = state.items.map((i) => movedItems.find((m) => m.id === i.id) ?? i);
  return { state: { ...state, items, places: state.places.filter((p) => p.id !== id) }, removePlaces: [id], ...(movedItems.length > 0 ? { put: movedItems } : {}) };
}

// The user's date (a day, or a month as its last day), or none (null).
export function setDate(state: Inventory, id: string, date: { date: string; precision: DatePrecision } | null, now: number): Change {
  const item = state.items.find((i) => i.id === id);
  if (!item) return { state };
  const { date: _d, datePrecision: _p, ...rest } = item;
  return replace(state, { ...rest, ...(date ? { date: date.date, datePrecision: date.precision } : {}), updatedAt: now });
}

// What kind of food it is ("Slags"). The barcode's memory follows (S-024).
export function setCategory(state: Inventory, id: string, category: Category, now: number): Change {
  const item = state.items.find((i) => i.id === id);
  if (!item) return { state };
  return withMemory(replace(state, { ...item, category, updatedAt: now }), id);
}

// Its size as a number and a unit, or none (null). The barcode's memory follows (S-024).
export function setSize(state: Inventory, id: string, size: Size | null, now: number): Change {
  const item = state.items.find((i) => i.id === id);
  if (!item) return { state };
  const { amount: _a, unit: _u, sizeText: _t, ...rest } = item;
  return withMemory(replace(state, { ...rest, ...(size ? { amount: size.amount, unit: size.unit } : {}), updatedAt: now }), id);
}

function replace(state: Inventory, next: Item): Change {
  return { state: { ...state, items: state.items.map((i) => (i.id === next.id ? next : i)) }, put: [next] };
}

// After a change to a thing with a remembered barcode, the memory is updated with it.
function withMemory(change: Change, id: string): Change {
  const item = change.state.items.find((i) => i.id === id);
  if (!item?.barcode || !change.state.products[item.barcode]) return change;
  const product = productOf({ ...item, barcode: item.barcode });
  return { ...change, state: { ...change.state, products: { ...change.state.products, [product.barcode]: product } }, putProducts: [product] };
}

// A deleted thing put back as it was ("Fortryd", S-024).
export function restoreItem(state: Inventory, item: Item, now: number): Change {
  if (state.items.some((i) => i.id === item.id)) return { state };
  const back = { ...item, updatedAt: now };
  return { state: { ...state, items: [...state.items, back] }, put: [back] };
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
