import { describe, expect, it } from 'vitest';
import { defaultPlaceKind } from './inventory/categories';
import { shownPlaces } from './inventory/shownPlaces';

const ids = (withFridge: boolean, inUse: string[] = [], current?: string) => shownPlaces(withFridge, (id) => inUse.includes(id), current).map((p) => p.id);

describe('the optional fridge (S-007)', () => {
  it('is hidden by default and shown when turned on', () => {
    expect(ids(false)).toEqual(['freezer', 'pantry']);
    expect(ids(true)).toEqual(['fridge', 'freezer', 'pantry']);
  });

  it('still shows while it holds things, or is the place in hand', () => {
    expect(ids(false, ['fridge'])).toEqual(['fridge', 'freezer', 'pantry']);
    expect(ids(false, [], 'fridge')).toEqual(['fridge', 'freezer', 'pantry']);
  });

  it('sends fridge things to the freezer or the pantry when it is off', () => {
    expect(defaultPlaceKind('poultry', true)).toBe('fridge');
    expect(defaultPlaceKind('poultry', false)).toBe('freezer');
    expect(defaultPlaceKind('leftovers', false)).toBe('freezer');
    expect(defaultPlaceKind('dairy', false)).toBe('pantry');
    expect(defaultPlaceKind('dry', false)).toBe('pantry');
    expect(defaultPlaceKind('frozen', false)).toBe('freezer');
  });
});
