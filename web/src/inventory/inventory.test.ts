import { describe, expect, it } from 'vitest';
import { addItem, EMPTY, moveItem, parseItem, parseProduct, productOf, rememberProduct, removeItem, restoreItem, setCategory, setCount, setDate, setSize, withBarcode, type Inventory, type Item, type NewItem } from './model';
import { countsByPlace, totalCount } from './summary';
import type { Place } from '../places';
import { searchItems } from './search';
import { parseOffProduct as parseOff } from '../scan/barcode';

// A freezer, a fridge and a cupboard, so moves between them can be tested.
const PLACES: Place[] = [
  { id: 'freezer', kind: 'freezer', sort: 0, updatedAt: 0 },
  { id: 'fridge', kind: 'fridge', sort: 1, updatedAt: 0 },
  { id: 'pantry', kind: 'pantry', sort: 2, updatedAt: 0 },
];

const milk: NewItem = { name: 'Letmælk', category: 'dairy', placeId: 'fridge', count: 2, barcode: '5701234567890' };

describe('Inventory changes', () => {
  it('adds, takes out, moves and removes, and says what to write', () => {
    let s: Inventory = { ...EMPTY, places: PLACES };
    const added = addItem(s, milk, 'a', '2026-11-07', 1);
    s = added.state;
    expect(added.put?.[0]).toMatchObject({ id: 'a', count: 2, addedOn: '2026-11-07', placedOn: '2026-11-07', updatedAt: 1 });
    expect(added.merged).toBe(false);

    const taken = setCount(s, 'a', 1, 2);
    expect(taken.state.items[0]?.count).toBe(1);
    expect(taken.put?.[0]?.updatedAt).toBe(2);

    const dated = setDate(taken.state, 'a', { date: '2026-11-12', precision: 'day' }, 3).state;
    const moved = moveItem(dated, 'a', 'freezer', '2026-11-08', 3);
    expect(moved.state.items[0]).toMatchObject({ placeId: 'freezer', placedOn: '2026-11-08', date: '2026-11-12', datePrecision: 'day' }); // the date stays
    expect(moveItem(moved.state, 'a', 'freezer', '2026-11-09', 4).put).toBeUndefined(); // already there

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

  it('gives a typed name a capital first letter', () => {
    expect(addItem(EMPTY, { ...milk, name: 'butter beans' }, 'a', '2026-11-07', 1).state.items[0]?.name).toBe('Butter beans');
  });
});

describe('The same thing, one line (S-022)', () => {
  const beans: NewItem = { name: 'Baked beans', category: 'canned', placeId: 'pantry', count: 4, amount: 415, unit: 'g' };
  const start = addItem({ ...EMPTY, places: PLACES }, beans, 'a', '2026-11-07', 1).state;

  it('adds to the count of the same name and size in the same place', () => {
    const more = addItem(start, { ...beans, name: 'baked BEANS', count: 4 }, 'b', '2026-11-08', 2);
    expect(more.merged).toBe(true);
    expect(more.id).toBe('a');
    expect(more.state.items).toHaveLength(1);
    expect(more.state.items[0]).toMatchObject({ id: 'a', count: 8, updatedAt: 2 });
  });
  it('keeps the earlier date', () => {
    const dated = setDate(start, 'a', { date: '2027-03-31', precision: 'month' }, 2).state;
    expect(addItem(dated, { ...beans, date: '2027-01-31', datePrecision: 'month' }, 'b', '2026-11-08', 3).state.items[0]).toMatchObject({ date: '2027-01-31', datePrecision: 'month' });
    expect(addItem(dated, { ...beans, date: '2028-01-31', datePrecision: 'month' }, 'b', '2026-11-08', 3).state.items[0]).toMatchObject({ date: '2027-03-31' });
    expect(addItem(start, { ...beans, date: '2027-01-31', datePrecision: 'month' }, 'b', '2026-11-08', 3).state.items[0]).toMatchObject({ date: '2027-01-31' });
  });
  it('keeps separate lines for another place or another size', () => {
    expect(addItem(start, { ...beans, placeId: 'fridge' }, 'b', '2026-11-08', 2).state.items).toHaveLength(2);
    expect(addItem(start, { ...beans, amount: 200 }, 'b', '2026-11-08', 2).state.items).toHaveLength(2);
    expect(addItem(start, { ...beans, name: 'Kidneybønner' }, 'b', '2026-11-08', 2).state.items).toHaveLength(2);
  });
});

describe('Date, group and size (S-021, S-022)', () => {
  const s = addItem(EMPTY, milk, 'a', '2026-11-07', 1).state;
  it('sets and clears the date, a day or a month', () => {
    const dated = setDate(s, 'a', { date: '2027-03-31', precision: 'month' }, 2);
    expect(dated.state.items[0]).toMatchObject({ date: '2027-03-31', datePrecision: 'month', updatedAt: 2 });
    const cleared = setDate(dated.state, 'a', null, 3).state.items[0];
    expect(cleared?.date).toBeUndefined();
    expect(cleared?.datePrecision).toBeUndefined();
  });
  it('sets the group', () => {
    expect(setCategory(s, 'a', 'drinks', 2).state.items[0]).toMatchObject({ category: 'drinks', updatedAt: 2 });
  });
  it('sets and clears the size', () => {
    const sized = setSize(s, 'a', { amount: 1, unit: 'l' }, 2).state.items[0];
    expect(sized).toMatchObject({ amount: 1, unit: 'l' });
    const cleared = setSize(s, 'a', null, 3).state.items[0];
    expect(cleared?.amount).toBeUndefined();
    expect(cleared?.unit).toBeUndefined();
  });
});

describe('Reading records back', () => {
  const base = { id: 'a', name: 'Mælk', placeId: 'fridge', category: 'dairy', count: 1, addedOn: '2026-11-07', updatedAt: 9 };
  it('reads back only sound records', () => {
    expect(parseItem({ id: 'a', name: ' Ost ', placeId: 'fridge', category: 'dairy', count: 2.4, amount: 400, unit: 'g', addedOn: '2026-11-07', updatedAt: 9 })).toMatchObject({ name: 'Ost', count: 2, amount: 400, unit: 'g' });
    expect(parseItem({ id: 'a', name: 'Ting', placeId: 'x', category: 'nope', count: -3 })).toMatchObject({ category: 'other', count: 1 });
    expect(parseItem({ name: 'No id' })).toBeNull();
    expect(parseItem('bad')).toBeNull();
    expect(parseProduct({ barcode: '123', name: 'X' })).toBeNull();
    expect(parseProduct({ barcode: '5701234567890', name: 'x', category: 'dairy', brand: 'Arla' })).toEqual({ barcode: '5701234567890', name: 'X', category: 'dairy' });
  });
  it('starts on the day added for older records, and reads the date and its precision', () => {
    expect(parseItem(base)).toMatchObject({ placedOn: '2026-11-07' });
    expect(parseItem({ ...base, date: '2027-03-31', datePrecision: 'month' })).toMatchObject({ date: '2027-03-31', datePrecision: 'month' });
    expect(parseItem({ ...base, date: '2027-03-31', datePrecision: 'weird' })).toMatchObject({ date: '2027-03-31', datePrecision: 'day' });
  });
  it('reads records from before S-021: the package date kept, the rest dropped', () => {
    const old = parseItem({ ...base, name: 'kyllingebryst', category: 'poultry', brand: 'Danpo', typeId: 'fk-117', openedOn: '2026-11-10', thawedOn: '2026-11-11', packageDate: '2026-11-12', packageKind: 'useBy' }) as Item;
    expect(old).toMatchObject({ name: 'Kyllingebryst', category: 'meat', date: '2026-11-12', datePrecision: 'day' });
    for (const gone of ['brand', 'typeId', 'openedOn', 'thawedOn', 'packageDate', 'packageKind']) expect(old).not.toHaveProperty(gone);
    expect(parseItem({ ...base, name: 'Frosne ærter', category: 'frozen' })).toMatchObject({ category: 'produce' });
    expect(parseItem({ ...base, name: 'Noget', category: 'frozen' })).toMatchObject({ category: 'other' });
  });
});

describe('Search across everything', () => {
  const items: Item[] = [
    { ...milk, id: 'a', addedOn: '2026-11-07', placedOn: '2026-11-07', updatedAt: 1 },
    { name: 'Kyllingebryst', category: 'meat', placeId: 'freezer', count: 1, id: 'b', addedOn: '2026-11-07', placedOn: '2026-11-07', updatedAt: 1 },
    { name: 'Mælkechokolade', category: 'snacks', placeId: 'pantry', count: 1, id: 'c', addedOn: '2026-11-07', placedOn: '2026-11-07', updatedAt: 1 },
  ];
  const labels = (i: Item) => [i.placeId === 'freezer' ? 'Fryser' : i.placeId === 'fridge' ? 'Køleskab' : 'Skab'];

  it('finds words anywhere in the name or place; name matches first', () => {
    expect(searchItems(items, 'mælk', labels).map((i) => i.id)).toEqual(['a', 'c']); // Letmælk, Mælkechokolade
    expect(searchItems(items, 'fryser', labels).map((i) => i.id)).toEqual(['b']);
    expect(searchItems(items, 'kyl fry', labels).map((i) => i.id)).toEqual(['b']);
    expect(searchItems(items, 'bryst', labels).map((i) => i.id)).toEqual(['b']); // inside a joined word
    expect(searchItems(items, 'ost', labels)).toEqual([]);
    expect(searchItems(items, '  ', labels)).toEqual([]);
  });
});

describe('Open Food Facts answer (S-022)', () => {
  it('reads the name, size and category tags, without the brand', () => {
    expect(parseOff({ status: 1, product: { product_name_da: 'Arla Letmælk', brands: 'Arla, Arla Foods', quantity: '1 l', categories_tags: ['en:dairies', 'en:milks', 7] } })).toEqual({
      name: 'Letmælk',
      quantity: '1 l',
      tags: ['en:dairies', 'en:milks'],
    });
    expect(parseOff({ status: 0 })).toBeNull();
  });
  it('capitalises, and uses the generic name when only the brand is left', () => {
    expect(parseOff({ status: 1, product: { product_name: 'butter beans', brands: 'Heinz' } })?.name).toBe('Butter beans');
    expect(parseOff({ status: 1, product: { product_name: 'Heinz Baked Beanz', brands: 'Heinz' } })?.name).toBe('Baked Beanz');
    expect(parseOff({ status: 1, product: { product_name: 'Nutella', generic_name: 'hazelnut spread', brands: 'Nutella, Ferrero' } })?.name).toBe('Hazelnut spread');
    expect(parseOff({ status: 1, product: { product_name: 'Nutella', brands: 'Nutella' } })?.name).toBe('Nutella');
  });
  it('drinks keep their brand', () => {
    expect(parseOff({ status: 1, product: { product_name: 'Coca-Cola Zero', brands: 'Coca-Cola', categories_tags: ['en:beverages', 'en:sodas'] } })?.name).toBe('Coca-Cola Zero');
  });
});

describe('Barcode memory (S-024)', () => {
  const code = '5000157024671';
  const beans: NewItem = { name: 'Baked beans', category: 'canned', placeId: 'pantry', count: 1, amount: 415, unit: 'g', barcode: code };

  it('remembers what the user settled on: name, group and size', () => {
    expect(productOf({ ...beans, barcode: code })).toEqual({ barcode: code, name: 'Baked beans', category: 'canned', amount: 415, unit: 'g' });
    expect(productOf({ name: 'Cola', category: 'drinks', sizeText: '6 x 1,5 l', barcode: code })).toEqual({ barcode: code, name: 'Cola', category: 'drinks', sizeText: '6 x 1,5 l' });
  });
  it('reads memories from before S-024, where the size was the lookup text', () => {
    expect(parseProduct({ barcode: code, name: 'Baked beans', quantity: '415 g', category: 'canned' })).toEqual({ barcode: code, name: 'Baked beans', category: 'canned', amount: 415, unit: 'g' });
    expect(parseProduct({ barcode: code, name: 'Cola', quantity: '6 x 1,5 l' })).toEqual({ barcode: code, name: 'Cola', sizeText: '6 x 1,5 l' });
    expect(parseProduct({ barcode: code, name: 'Kylling', category: 'poultry' })).toMatchObject({ category: 'meat' });
  });
  it('a merge keeps the barcode, so the next scan finds the line', () => {
    const typed = addItem({ ...EMPTY, places: PLACES }, { ...beans, barcode: undefined }, 'a', '2026-11-07', 1).state;
    const scanned = addItem(typed, beans, 'b', '2026-11-08', 2);
    expect(scanned.merged).toBe(true);
    expect(scanned.state.items[0]).toMatchObject({ id: 'a', count: 2, barcode: code });
  });
  it('a new group or size on the thing updates the memory', () => {
    let s = addItem({ ...EMPTY, places: PLACES }, beans, 'a', '2026-11-07', 1).state;
    s = rememberProduct(s, productOf({ ...beans, barcode: code })).state;
    const sized = setSize(s, 'a', { amount: 400, unit: 'g' }, 2);
    expect(sized.putProducts?.[0]).toMatchObject({ amount: 400, unit: 'g' });
    expect(setCategory(sized.state, 'a', 'dry', 3).state.products[code]).toMatchObject({ category: 'dry', amount: 400 });
    // Without a memory, nothing is remembered.
    expect(setSize(addItem(EMPTY, beans, 'a', '2026-11-07', 1).state, 'a', null, 2).putProducts).toBeUndefined();
  });
});

describe('Undo (S-024)', () => {
  it('puts a deleted thing back as it was', () => {
    const s = addItem(EMPTY, milk, 'a', '2026-11-07', 1).state;
    const gone = s.items[0]!;
    const back = restoreItem(removeItem(s, 'a').state, gone, 5);
    expect(back.state.items[0]).toMatchObject({ ...gone, updatedAt: 5 });
    expect(restoreItem(s, gone, 6).put).toBeUndefined(); // still there: nothing to do
  });
});

describe('Counts (S-024)', () => {
  it('adds up the counts, in all and per place', () => {
    const items = [
      { placeId: 'a', count: 2 },
      { placeId: 'b', count: 1 },
      { placeId: 'a', count: 3 },
    ];
    expect(totalCount(items)).toBe(6);
    expect(countsByPlace(items).get('a')).toBe(5);
    expect(countsByPlace(items).get('c')).toBeUndefined();
  });
});
