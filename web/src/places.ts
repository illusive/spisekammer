// The places things are kept (S-002). A new household starts with these three; its own places
// come with households (slice 4). The kind decides which keeping times apply (slice 3).
// The fridge is optional and off by default (S-007): its things change every day, so a list of
// them soon goes wrong. The freezer and the cupboards are what the app is for.

import type { Strings } from './i18n/strings';
import { useInventory } from './inventory/store';
import { usePreferences } from './settings/preferences';

export type PlaceKind = 'fridge' | 'freezer' | 'pantry';

export interface Place {
  id: string;
  kind: PlaceKind;
}

export const DEFAULT_PLACES: Place[] = [
  { id: 'fridge', kind: 'fridge' },
  { id: 'freezer', kind: 'freezer' },
  { id: 'pantry', kind: 'pantry' },
];

export const placeOf = (id: string): Place | undefined => DEFAULT_PLACES.find((p) => p.id === id);

export function placeName(id: string, s: Strings): string {
  const place = placeOf(id);
  return place ? s.placeKinds[place.kind] : id;
}

// The place of that kind (the defaults use the kind as their id).
export const placeIdOf = (kind: PlaceKind): string => DEFAULT_PLACES.find((p) => p.kind === kind)?.id ?? kind;

// The places to show: all but the fridge, which shows when it is turned on, when it still holds
// things (so nothing is hidden after turning it off), or when it is the place in hand.
export function shownPlaces(withFridge: boolean, inUse: (placeId: string) => boolean, current?: string): Place[] {
  return DEFAULT_PLACES.filter((p) => p.kind !== 'fridge' || withFridge || p.id === current || inUse(p.id));
}

export function useShownPlaces(current?: string): Place[] {
  const { fridge } = usePreferences();
  const { items } = useInventory();
  return shownPlaces(fridge, (id) => items.some((i) => i.placeId === id), current);
}
