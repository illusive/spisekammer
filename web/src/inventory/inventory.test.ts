import { describe, expect, it } from 'vitest';
import { categoryFromTags, guessCategory, soundsFrozen } from './categories';
import { addItem, EMPTY, moveItem, parseItem, parseProduct, rememberProduct, removeItem, setCount, setOpened, setPackageDate, setType, withBarcode, type Inventory, type NewItem } from './model';
import type { Place } from '../places';

// A freezer, a fridge and a cupboard, so moves between them can be tested.
const PLACES: Place[] = [
  { id: 'freezer', kind: 'freezer', sort: 0, updatedAt: 0 },
  { id: 'fridge', kind: 'fridge', sort: 1, updatedAt: 0 },
  { id: 'pantry', kind: 'pantry', sort: 2, updatedAt: 0 },
];
import { searchItems } from './search';
import { parseProduct as parseOff } from '../scan/barcode';

const milk: NewItem = { name: 'Letmælk', brand: 'Arla', category: 'dairy', placeId: 'fridge', count: 2, barcode: '5701234567890' };

describe('Inventory changes', () => {
  it('adds, takes out, moves and removes, and says what to write', () => {
    let s: Inventory = { ...EMPTY, places: PLACES };
    const added = addItem(s, milk, 'a', '2026-11-07', 1);
    s = added.state;
    expect(added.put?.[0]).toMatchObject({ id: 'a', count: 2, addedOn: '2026-11-07', placedOn: '2026-11-07', updatedAt: 1 });

    const taken = setCount(s, 'a', 1, 2);
    expect(taken.state.items[0]?.count).toBe(1);
    expect(taken.put?.[0]?.updatedAt).toBe(2);

    const moved = moveItem(taken.state, 'a', 'freezer', '2026-11-08', 3);
    expect(moved.state.items[0]).toMatchObject({ placeId: 'freezer', placedOn: '2026-11-08' });
    expect(moved.state.items[0]?.thawedOn).toBeUndefined();
    expect(moveItem(moved.state, 'a', 'freezer', '2026-11-09', 4).put).toBeUndefined(); // already there

    const thawed = moveItem(moved.state, 'a', 'fridge', '2026-12-01', 4);
    expect(thawed.state.items[0]).toMatchObject({ placeId: 'fridge', placedOn: '2026-12-01', thawedOn: '2026-12-01' });
    expect(moveItem(thawed.state, 'a', 'pantry', '2026-12-02', 4).state.items[0]?.thawedOn).toBeUndefined(); // only while in the fridge

    const last = setCount(moved.state, 'a', 0, 5); // taking the last one out removes it
    expect(last.state.items).toEqual([]);
    expect(last.remove).toEqual(['a']);

    expect(removeItem(EMPTY, 'x').remove).toBeUndefined();
  });

  it('keeps counts within 1–999 and finds things by barcode', () => {
    const s = addItem(EMPTY, { ...milk, count: 5000 }, 'a', '2026-11-07', 1).state;
    expect(s.items[0]?.count).toBe(999);
    expect(withBarcode(s, '5701234567890').map((i) => i.id)).toEqual(['a']);
    expect(rememberProduct(s, { barcode: '5701234567890', name: 'Letmælk' }).state.products['5701234567890']?.name).toBe('Letmælk');
  });

  it('reads back only sound records', () => {
    expect(parseItem({ id: 'a', name: ' Ost ', placeId: 'fridge', category: 'dairy', count: 2.4, amount: 400, unit: 'g', addedOn: '2026-11-07', updatedAt: 9 })).toMatchObject({ name: 'Ost', count: 2, amount: 400, unit: 'g' });
    expect(parseItem({ id: 'a', name: 'Ting', placeId: 'x', category: 'nope', count: -3 })).toMatchObject({ category: 'other', count: 1 });
    expect(parseItem({ name: 'No id' })).toBeNull();
    expect(parseItem('bad')).toBeNull();
    expect(parseProduct({ barcode: '123', name: 'X' })).toBeNull();
    expect(parseProduct({ barcode: '5701234567890', name: 'X', category: 'dairy' })).toEqual({ barcode: '5701234567890', name: 'X', category: 'dairy' });
  });
});

describe('Dates and food type (S-010)', () => {
  const s = addItem(EMPTY, milk, 'a', '2026-11-07', 1).state;
  it('marks opened and undoes it', () => {
    const opened = setOpened(s, 'a', '2026-11-08', 2);
    expect(opened.put?.[0]).toMatchObject({ openedOn: '2026-11-08', updatedAt: 2 });
    expect(setOpened(opened.state, 'a', null, 3).state.items[0]?.openedOn).toBeUndefined();
  });
  it('sets and clears the package date', () => {
    const dated = setPackageDate(s, 'a', { day: '2026-11-12', kind: 'useBy' }, 2);
    expect(dated.state.items[0]).toMatchObject({ packageDate: '2026-11-12', packageKind: 'useBy' });
    const cleared = setPackageDate(dated.state, 'a', null, 3).state.items[0];
    expect(cleared?.packageDate).toBeUndefined();
    expect(cleared?.packageKind).toBeUndefined();
  });
  it('sets the food type with its category, or only a category', () => {
    expect(setType(s, 'a', 'fk-27', 'dairy', 2).state.items[0]).toMatchObject({ typeId: 'fk-27', category: 'dairy' });
    expect(setType(s, 'a', null, 'other', 2).state.items[0]?.typeId).toBeUndefined();
  });
  it('reads the dates back, and starts the clock on the day added for older records', () => {
    const base = { id: 'a', name: 'Mælk', placeId: 'fridge', category: 'dairy', count: 1, addedOn: '2026-11-07', updatedAt: 9 };
    expect(parseItem(base)).toMatchObject({ placedOn: '2026-11-07' });
    expect(parseItem({ ...base, placedOn: '2026-11-09', openedOn: '2026-11-10', typeId: 'fk-27', packageDate: '2026-11-12', packageKind: 'useBy' })).toMatchObject({ placedOn: '2026-11-09', openedOn: '2026-11-10', typeId: 'fk-27', packageDate: '2026-11-12', packageKind: 'useBy' });
    expect(parseItem({ ...base, packageDate: '2026-11-12', packageKind: 'soon', typeId: 'x' })).not.toHaveProperty('packageDate');
  });
});

describe('Categories', () => {
  it('guesses from the name', () => {
    expect(guessCategory('Kyllingebryst')).toBe('poultry');
    expect(guessCategory('Hakket oksekød 8-12%')).toBe('meat');
    expect(guessCategory('Letmælk')).toBe('dairy');
    expect(guessCategory('Hakkede tomater')).toBe('canned');
    expect(guessCategory('Havregryn')).toBe('dry');
    expect(guessCategory('Kartofler')).toBe('produce');
    expect(guessCategory('Frosne ærter')).toBe('frozen');
    expect(guessCategory('Frosne kyllingebryst')).toBe('poultry');
    expect(soundsFrozen('Frosne kyllingebryst')).toBe(true);
    expect(soundsFrozen('Kyllingebryst')).toBe(false);
    expect(guessCategory('Opvaskemiddel')).toBeNull();
  });

  it('guesses from Open Food Facts tags', () => {
    expect(categoryFromTags(['en:dairies', 'en:milks'])).toBe('dairy');
    expect(categoryFromTags(['en:frozen-foods', 'en:meats'])).toBe('frozen');
    expect(categoryFromTags(['en:snacks'])).toBeNull();
  });
});

describe('Search across everything', () => {
  const items = [
    { ...milk, id: 'a', addedOn: '2026-11-07', placedOn: '2026-11-07', updatedAt: 1 },
    { name: 'Kyllingebryst', category: 'poultry' as const, placeId: 'freezer', count: 1, id: 'b', addedOn: '2026-11-07', placedOn: '2026-11-07', updatedAt: 1 },
    { name: 'Mælkechokolade', category: 'other' as const, placeId: 'pantry', count: 1, id: 'c', addedOn: '2026-11-07', placedOn: '2026-11-07', updatedAt: 1 },
  ];
  const labels = (i: (typeof items)[number]) => [i.placeId === 'freezer' ? 'Fryser' : i.placeId === 'fridge' ? 'Køleskab' : 'Skab'];

  it('finds words anywhere in the name, brand or place; name matches first', () => {
    expect(searchItems(items, 'mælk', labels).map((i) => i.id)).toEqual(['a', 'c']); // Letmælk, Mælkechokolade
    expect(searchItems(items, 'arla', labels).map((i) => i.id)).toEqual(['a']);
    expect(searchItems(items, 'fryser', labels).map((i) => i.id)).toEqual(['b']);
    expect(searchItems(items, 'kyl fry', labels).map((i) => i.id)).toEqual(['b']);
    expect(searchItems(items, 'bryst', labels).map((i) => i.id)).toEqual(['b']); // inside a joined word
    expect(searchItems(items, 'ost', labels)).toEqual([]);
    expect(searchItems(items, '  ', labels)).toEqual([]);
  });
});

describe('Open Food Facts answer', () => {
  it('reads the name, brand, size and category tags', () => {
    expect(parseOff({ status: 1, product: { product_name_da: 'Letmælk', brands: 'Arla, Other', quantity: '1 l', categories_tags: ['en:dairies', 'en:milks', 7] } })).toEqual({
      name: 'Letmælk',
      brand: 'Arla',
      quantity: '1 l',
      tags: ['en:dairies', 'en:milks'],
    });
    expect(parseOff({ status: 0 })).toBeNull();
  });
});
