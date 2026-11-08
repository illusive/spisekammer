import { describe, expect, it } from 'vitest';
import { strings } from './i18n/strings';
import { addItem, addPlace, EMPTY, parsePlace, removePlace, updatePlace, type Inventory } from './inventory/model';
import { DEFAULT_PLACES, placeName, startingPlaces, type Place } from './places';

const da = strings.da;
const en = strings.en;

describe('the starting places (S-013)', () => {
  it('are Fryser, Skabe and Viktualiekammer, without a fridge', () => {
    const { places, added } = startingPlaces([], [], false);
    expect(places.map((p) => placeName(places, p.id, da))).toEqual(['Fryser', 'Skabe', 'Viktualiekammer']);
    expect(places.map((p) => placeName(places, p.id, en))).toEqual(['Freezer', 'Cupboards', 'Larder']);
    expect(places.map((p) => p.kind)).toEqual(['freezer', 'pantry', 'pantry']);
    expect(places.some((p) => p.kind === 'fridge')).toBe(false);
    expect(added).toEqual(DEFAULT_PLACES);
  });

  it('keep a fridge for phones that had things in it, or the old fridge switch on', () => {
    expect(startingPlaces([], ['fridge', 'freezer'], false).places.map((p) => p.id)).toEqual(['freezer', 'pantry', 'larder', 'fridge']);
    expect(startingPlaces([], [], true).added.map((p) => p.id)).toEqual(['freezer', 'pantry', 'larder', 'fridge']);
  });

  it('never leave a thing without a place, and change nothing once places are stored', () => {
    const stored: Place[] = [{ id: 'x', kind: 'freezer', name: 'Garagen', sort: 0, updatedAt: 1 }];
    expect(startingPlaces(stored, ['x'], true)).toEqual({ places: stored, added: [] });
    const { added } = startingPlaces(stored, ['x', 'gone'], false);
    expect(added).toEqual([{ id: 'gone', kind: 'pantry', name: 'gone', sort: 1, updatedAt: 0 }]);
  });
});

describe('places the household makes', () => {
  const start: Inventory = { ...EMPTY, places: DEFAULT_PLACES };

  it('adds a place with a name and a kind, last in the list', () => {
    const c = addPlace(start, { id: 'g', name: '  Fryser i garagen ', kind: 'freezer' }, 5);
    expect(c.putPlaces).toEqual([{ id: 'g', kind: 'freezer', name: 'Fryser i garagen', sort: 3, updatedAt: 5 }]);
    expect(placeName(c.state.places, 'g', da)).toBe('Fryser i garagen');
  });

  it('renames a preset, and an empty name gives it its own name back', () => {
    const renamed = updatePlace(start, 'pantry', { name: 'Køkkenskab' }, 2).state;
    expect(placeName(renamed.places, 'pantry', da)).toBe('Køkkenskab');
    expect(placeName(updatePlace(renamed, 'pantry', { name: ' ' }, 3).state.places, 'pantry', da)).toBe('Skabe');
  });

  it('changes the kind', () => {
    expect(updatePlace(start, 'larder', { kind: 'fridge' }, 2).state.places.find((p) => p.id === 'larder')?.kind).toBe('fridge');
  });

  it('deletes a place only after moving its things, and never the last one', () => {
    let s = addItem(start, { name: 'Ærter', category: 'frozen', placeId: 'freezer', count: 1 }, 'a', '2026-11-07', 1).state;
    expect(removePlace(s, 'freezer', null, '2026-11-08', 2).state).toBe(s); // things, nowhere to go
    expect(removePlace(s, 'freezer', 'freezer', '2026-11-08', 2).state).toBe(s);
    const c = removePlace(s, 'freezer', 'pantry', '2026-11-08', 2);
    expect(c.removePlaces).toEqual(['freezer']);
    expect(c.put?.[0]).toMatchObject({ id: 'a', placeId: 'pantry', placedOn: '2026-11-08' });
    s = c.state;
    expect(removePlace(s, 'larder', null, '2026-11-08', 3).removePlaces).toEqual(['larder']); // empty: just goes
    const one = { ...EMPTY, places: [DEFAULT_PLACES[0]!] };
    expect(removePlace(one, 'freezer', null, '2026-11-08', 3).state).toBe(one);
  });

  it('reads places back, dropping broken ones', () => {
    expect(parsePlace({ id: 'g', kind: 'freezer', name: 'Garagen', sort: 4, updatedAt: 9 })).toEqual({ id: 'g', kind: 'freezer', name: 'Garagen', sort: 4, updatedAt: 9 });
    expect(parsePlace({ id: 'g', kind: 'cellar' })).toBeNull();
    expect(parsePlace({ kind: 'freezer' })).toBeNull();
  });

  it('names a place that no longer exists', () => {
    expect(placeName(DEFAULT_PLACES, 'nope', da)).toBe('Slettet sted');
  });
});
