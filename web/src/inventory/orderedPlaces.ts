// The household's places in the order chosen in Steder: alphabetical until the user moves one
// (S-019, S-022). And where adding starts (S-022): the place you are on, else the last one used.
import { useState } from 'react';
import type { Strings } from '../i18n/strings';
import { orderPlaces, type Place } from '../places';
import { readPreferences, setPreference, usePreferences } from '../settings/preferences';
import { useInventory } from './store';

export function useOrderedPlaces(s: Strings): Place[] {
  const { placeOrder } = usePreferences();
  return orderPlaces(useInventory().places, placeOrder, s);
}

export function useStartPlace(s: Strings, given: string | null): [string, (placeId: string) => void] {
  const ordered = useOrderedPlaces(s);
  const { lastPlaceId: last } = usePreferences();
  const [chosen, setChosen] = useState<string | null>(given);
  const exists = (id: string | null): id is string => id !== null && ordered.some((p) => p.id === id);
  const placeId = exists(chosen) ? chosen : exists(last) ? last : (ordered[0]?.id ?? '');
  return [placeId, setChosen];
}

// After adding: the next add form starts here.
export const rememberPlace = (placeId: string) => {
  if (readPreferences().lastPlaceId !== placeId) setPreference('lastPlaceId', placeId);
};
