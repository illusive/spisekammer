// A thing's date in its place: the user's date (or none) and how soon to use it (S-021).

import type { Item } from '../inventory/model';
import { placeOf, type Place, type PlaceKind } from '../places';
import { urgency, type Urgency } from './rules';

export interface ItemKeeping {
  place: PlaceKind;
  urgency: Urgency;
}

export function itemKeeping(item: Item, today: string, places: Place[]): ItemKeeping {
  const place = placeOf(places, item.placeId)?.kind ?? 'pantry';
  return { place, urgency: urgency(item.date, place, today) };
}
