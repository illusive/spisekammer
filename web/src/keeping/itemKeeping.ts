// A thing's keeping, from its food type, place and dates (keeping/rules.ts), plus which kind of
// date a food type's package usually has.

import type { Item } from '../inventory/model';
import { placeOf, type Place, type PlaceKind } from '../places';
import { foodType } from './foodTypes';
import { keeping, urgency, type Keeping, type PackageKind, type Urgency } from './rules';
import type { FoodType } from './types';

export interface ItemKeeping {
  keeping: Keeping;
  type: FoodType | undefined;
  place: PlaceKind;
  urgency: Urgency;
}

export function itemKeeping(item: Item, today: string, places: Place[]): ItemKeeping {
  const type = foodType(item.typeId);
  const place = placeOf(places, item.placeId)?.kind ?? 'pantry';
  const k = keeping({ type, place, placedOn: item.placedOn, openedOn: item.openedOn, thawedOn: item.thawedOn, packageDate: item.packageDate, packageKind: item.packageKind });
  return { keeping: k, type, place, urgency: urgency(k, place, today) };
}

// Raw meat, poultry and fish carry "sidste anvendelsesdato" in Denmark; most other things "bedst før".
export function defaultPackageKind(type: FoodType | undefined): PackageKind {
  return type && ['meat', 'poultry', 'fish'].includes(type.category) ? 'useBy' : 'bestBefore';
}
