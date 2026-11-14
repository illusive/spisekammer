// The household's places in the order chosen in Steder (S-019): alphabetical by default.
import type { Strings } from '../i18n/strings';
import { orderPlaces, type Place } from '../places';
import { usePreferences } from '../settings/preferences';
import { useInventory } from './store';

export function useOrderedPlaces(s: Strings): Place[] {
  const { placeOrder } = usePreferences();
  return orderPlaces(useInventory().places, placeOrder, s);
}
