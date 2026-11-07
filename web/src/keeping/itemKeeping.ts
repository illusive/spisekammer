// A thing's keeping, from its food type, place and dates (keeping/rules.ts), plus the defaults the
// add form uses: which place a food type starts in, and which kind of date its package has.

import { defaultPlaceKind } from '../inventory/categories';
import type { Item } from '../inventory/model';
import { placeOf, type PlaceKind } from '../places';
import { foodType } from './foodTypes';
import { keeping, urgency, type Keeping, type PackageKind, type Urgency } from './rules';
import type { FoodType, Time } from './types';

export interface ItemKeeping {
  keeping: Keeping;
  type: FoodType | undefined;
  place: PlaceKind;
  urgency: Urgency;
}

export function itemKeeping(item: Item, today: string): ItemKeeping {
  const type = foodType(item.typeId);
  const place = placeOf(item.placeId)?.kind ?? 'pantry';
  const k = keeping({ type, place, placedOn: item.placedOn, openedOn: item.openedOn, thawedOn: item.thawedOn, packageDate: item.packageDate, packageKind: item.packageKind });
  return { keeping: k, type, place, urgency: urgency(k, place, today) };
}

const usable = (t: Time | undefined) => t !== undefined && t !== 'notRecommended';

// Where a food type starts: frozen food in the freezer; what keeps in the pantry there; else the
// fridge when it is turned on; what only has a freezer time in the freezer; else by category (S-007).
export function placeKindForType(type: FoodType, withFridge: boolean): PlaceKind {
  const t = type.times;
  if (type.category === 'frozen') return 'freezer';
  if (typeof t.pantry === 'object' && t.pantry.unit !== 'hours') return 'pantry';
  if (t.pantry === 'indefinitely' || t.pantry === 'whenRipe') return 'pantry';
  if (withFridge && usable(t.fridge)) return 'fridge';
  if (!usable(t.pantry) && !usable(t.fridge) && usable(t.freezer)) return 'freezer';
  return defaultPlaceKind(type.category, withFridge);
}

// Raw meat, poultry and fish carry "sidste anvendelsesdato" in Denmark; most other things "bedst før".
export function defaultPackageKind(type: FoodType | undefined): PackageKind {
  return type && ['meat', 'poultry', 'fish'].includes(type.category) ? 'useBy' : 'bestBefore';
}
