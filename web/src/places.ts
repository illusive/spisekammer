// The places things are kept (S-002, S-013). The household makes its own: more freezers, several
// cupboards, a cellar. Each place has a kind, Frost, Køl or Tørvarer, which decides the keeping
// times (keeping/rules.ts). New households start with Fryser, Skabe and Viktualiekammer; a fridge
// is a place of the kind Køl that the user adds (S-007 is replaced: no switch).
//
// Pure: the list lives in the inventory (inventory/store.ts) and is passed in.

import type { Strings } from './i18n/strings';

export type PlaceKind = 'fridge' | 'freezer' | 'pantry';
export const PLACE_KINDS: PlaceKind[] = ['freezer', 'fridge', 'pantry']; // the order in pickers

export interface Place {
  id: string;
  kind: PlaceKind;
  name?: string; // none: the preset's name in the user's language (Fryser / Freezer)
  sort: number;
  updatedAt: number;
}

// The places a new household starts with. Their ids keep things added before S-013 where they
// were: 'freezer' and 'pantry' (Forråd, now Skabe).
export const PRESET_IDS = ['freezer', 'pantry', 'larder', 'fridge'] as const;
export type PresetId = (typeof PRESET_IDS)[number];
const isPreset = (id: string): id is PresetId => (PRESET_IDS as readonly string[]).includes(id);

export const DEFAULT_PLACES: Place[] = [
  { id: 'freezer', kind: 'freezer', sort: 0, updatedAt: 0 },
  { id: 'pantry', kind: 'pantry', sort: 1, updatedAt: 0 },
  { id: 'larder', kind: 'pantry', sort: 2, updatedAt: 0 },
];

export const sortPlaces = (places: Place[]) => [...places].sort((a, b) => a.sort - b.sort || a.id.localeCompare(b.id));
export const placeOf = (places: Place[], id: string): Place | undefined => places.find((p) => p.id === id);

export function placeName(places: Place[], id: string, s: Strings): string {
  const place = placeOf(places, id);
  if (!place) return s.placeGone;
  return place.name ?? (isPreset(place.id) ? s.placePresets[place.id] : s.placeKinds[place.kind]);
}

// The places to keep when the app starts: the stored ones; or, the first time (and for phones from
// before S-013), the defaults plus a fridge if things are in it or the old fridge switch was on,
// and a place for any other place a thing points to, so nothing is ever left without one.
export function startingPlaces(stored: Place[], itemPlaceIds: string[], fridgeWasOn: boolean): { places: Place[]; added: Place[] } {
  const places = stored.length > 0 ? [...stored] : [...DEFAULT_PLACES];
  const added = stored.length > 0 ? [] : [...DEFAULT_PLACES];
  const add = (place: Place) => {
    places.push(place);
    added.push(place);
  };
  const nextSort = () => Math.max(-1, ...places.map((p) => p.sort)) + 1;
  if (stored.length === 0 && fridgeWasOn && !itemPlaceIds.includes('fridge')) add({ id: 'fridge', kind: 'fridge', sort: nextSort(), updatedAt: 0 });
  for (const id of new Set(itemPlaceIds)) {
    if (placeOf(places, id)) continue;
    add(id === 'fridge' ? { id, kind: 'fridge', sort: nextSort(), updatedAt: 0 } : { id, kind: 'pantry', name: id, sort: nextSort(), updatedAt: 0 });
  }
  return { places, added };
}
