// The food types and their keeping times (S-009), built from USDA FoodKeeper (CC0, v128) by
// scripts/build-food-types.ts into food-types.json. Only the names, the category and the words
// that point to a type are ours; every time is read from its FoodKeeper record.

import type { Category } from '../inventory/categories';

export type Unit = 'hours' | 'days' | 'weeks' | 'months' | 'years';
export interface Span {
  min: number;
  max: number;
  unit: Unit;
}
// A span, or what FoodKeeper says instead of one.
export type Time = Span | 'notRecommended' | 'indefinitely' | 'useBy' | 'whenRipe';

// Where, and from when: in the place from the day it came there, after opening, after thawing.
export type TimeKey = 'pantry' | 'pantryOpened' | 'fridge' | 'fridgeOpened' | 'fridgeThawed' | 'freezer';
export const TIME_KEYS: TimeKey[] = ['pantry', 'pantryOpened', 'fridge', 'fridgeOpened', 'fridgeThawed', 'freezer'];

export interface FoodType {
  id: string; // fk-<FoodKeeper ID>, stable
  fk: number;
  category: Category;
  da: string;
  en: string;
  checked: boolean; // the Danish name has been checked by a person
  keys: string[]; // words that point to this type (see keeping/match.ts)
  times: Partial<Record<TimeKey, Time>>;
}

export interface FoodTypeData {
  source: { id: string; title: string; publisher: string; license: string; version: string; sha256: string; url: string };
  types: FoodType[];
}
