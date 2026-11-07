// Which places to show (S-007): the fridge is optional. Kept apart from places.ts so that module
// stays free of the store (the store uses it for place kinds).

import { DEFAULT_PLACES, type Place } from '../places';
import { usePreferences } from '../settings/preferences';
import { useInventory } from './store';

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
