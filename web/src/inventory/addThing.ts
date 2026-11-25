// Adding a thing, the same way from "Tilføj" and from the scanner (S-022, S-024): add it (or add to
// the same line), remember the place for the next time, remember the barcode with what the user
// settled on, and say what happened.

import type { Strings } from '../i18n/strings';
import { placeName } from '../places';
import { productOf, type NewItem } from './model';
import { rememberPlace } from './orderedPlaces';
import { inventory } from './store';

export function addThing(item: NewItem, s: Strings): string {
  const result = inventory.add(item);
  rememberPlace(item.placeId);
  if (item.barcode) inventory.rememberProduct(productOf({ ...item, barcode: item.barcode }));
  return result.merged ? s.stocked(item.name, result.count) : s.added(item.name, placeName(inventory.get().places, item.placeId, s));
}
