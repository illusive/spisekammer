// Food categories for the overview (S-005, S-006), with a first guess from the name and from Open
// Food Facts' categories, and the place a new thing of that kind usually goes. Slice 3 replaces the
// guess with food types from FoodKeeper; the categories stay. Pure.

import { fold } from '../lib/fold';
import type { PlaceKind } from '../places';

export const CATEGORIES = ['meat', 'poultry', 'fish', 'dairy', 'produce', 'bread', 'dry', 'canned', 'drinks', 'leftovers', 'frozen', 'other'] as const;
export type Category = (typeof CATEGORIES)[number];

// Where a new thing goes, unless the user picks another place.
export const DEFAULT_PLACE: Record<Category, PlaceKind> = {
  meat: 'fridge',
  poultry: 'fridge',
  fish: 'fridge',
  dairy: 'fridge',
  produce: 'fridge',
  bread: 'pantry',
  dry: 'pantry',
  canned: 'pantry',
  drinks: 'pantry',
  leftovers: 'fridge',
  frozen: 'freezer',
  other: 'pantry',
};

// Words that say a thing is frozen. Such a thing starts in the freezer, whatever its category.
const FROZEN_WORDS = ['frost', 'frosne', 'frossen', 'frosset', 'dybfrost', 'flødeis', 'ispind', 'frozen', 'ice cream'];

// Danish and English words that start a word of the name (folded: case and accents ignored).
const WORDS: [Category, string[]][] = [
  ['poultry', ['kylling', 'kalkun', 'andebryst', 'andelår', 'chicken', 'turkey']],
  ['fish', ['laks', 'torsk', 'fisk', 'rejer', 'tun', 'makrel', 'sild', 'rødspætte', 'salmon', 'cod', 'fish', 'shrimp', 'tuna']],
  ['meat', ['hakket', 'hakkebøf', 'oksekød', 'okse', 'svinekød', 'svin', 'flæsk', 'bacon', 'pølse', 'skinke', 'kotelet', 'mørbrad', 'lam', 'kød', 'beef', 'pork', 'mince', 'sausage', 'ham', 'meat']],
  ['dairy', ['mælk', 'minimælk', 'letmælk', 'skummetmælk', 'ost', 'yoghurt', 'skyr', 'smør', 'fløde', 'creme fraiche', 'æg', 'kvark', 'milk', 'cheese', 'butter', 'cream', 'egg']],
  ['produce', ['æble', 'banan', 'pære', 'appelsin', 'citron', 'gulerod', 'gulerødder', 'kartof', 'løg', 'salat', 'agurk', 'tomat', 'peberfrugt', 'broccoli', 'blomkål', 'kål', 'bær', 'jordbær', 'apple', 'banana', 'carrot', 'potato', 'onion', 'lettuce', 'cucumber']],
  ['bread', ['brød', 'rugbrød', 'franskbrød', 'bolle', 'boller', 'toast', 'knækbrød', 'tortilla', 'bread', 'bun']],
  ['canned', ['dåse', 'konserves', 'hakkede tomater', 'flåede tomater', 'bønner', 'kikærter', 'majs', 'syltetøj', 'marmelade', 'canned', 'beans', 'jam']],
  ['dry', ['ris', 'pasta', 'spaghetti', 'makaroni', 'mel', 'hvedemel', 'havregryn', 'gryn', 'müsli', 'sukker', 'salt', 'linser', 'couscous', 'nudler', 'rice', 'flour', 'oats', 'sugar', 'noodles']],
  ['drinks', ['juice', 'saft', 'sodavand', 'cola', 'øl', 'vin', 'vand', 'kaffe', 'beer', 'wine', 'water', 'coffee', 'tea']],
  ['leftovers', ['rester', 'rest', 'madpakke', 'leftovers']],
  // Last, so a named food keeps its own category ("Frosne kyllingebryst" is poultry, in the freezer).
  ['frozen', FROZEN_WORDS],
];

// Phrases ("hakkede tomater") are checked before single words ("tomat"), so the more specific wins.
export function guessCategory(name: string): Category | null {
  const text = fold(name);
  const words = text.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  for (const phrases of [true, false]) {
    for (const [category, keys] of WORDS) {
      for (const key of keys) {
        const k = fold(key);
        if (k.includes(' ') !== phrases) continue;
        if (phrases ? text.includes(k) : words.some((w) => w.startsWith(k))) return category;
      }
    }
  }
  return null;
}

// Whether the name says the thing is frozen ("Frosne ærter", "Frozen peas").
export function soundsFrozen(name: string): boolean {
  const text = fold(name);
  const words = text.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  return FROZEN_WORDS.some((key) => {
    const k = fold(key);
    return k.includes(' ') ? text.includes(k) : words.some((w) => w.startsWith(k));
  });
}

// Open Food Facts category tags ("en:meats", "en:dairies" …), most specific checked first.
const OFF_TAGS: [Category, string[]][] = [
  ['frozen', ['en:frozen-foods']],
  ['poultry', ['en:poultries', 'en:chickens', 'en:chicken-meats']],
  ['fish', ['en:fishes', 'en:seafood', 'en:fish-and-seafood']],
  ['meat', ['en:meats', 'en:sausages', 'en:hams']],
  ['dairy', ['en:dairies', 'en:cheeses', 'en:milks', 'en:yogurts', 'en:butters', 'en:eggs']],
  ['canned', ['en:canned-foods', 'en:jams']],
  ['bread', ['en:breads', 'en:crispbreads']],
  ['dry', ['en:cereals-and-potatoes', 'en:pastas', 'en:rices', 'en:flours', 'en:breakfast-cereals']],
  ['drinks', ['en:beverages']],
  ['produce', ['en:fresh-fruits', 'en:fresh-vegetables', 'en:fruits', 'en:vegetables']],
];

export function categoryFromTags(tags: string[]): Category | null {
  for (const [category, keys] of OFF_TAGS) if (keys.some((k) => tags.includes(k))) return category;
  return null;
}

// Without the fridge (S-007), what would go there starts where it is worth keeping track of:
// meat, fish and leftovers in the freezer, the rest in the cupboard.
const WITHOUT_FRIDGE: Partial<Record<Category, PlaceKind>> = { meat: 'freezer', poultry: 'freezer', fish: 'freezer', leftovers: 'freezer' };

export function defaultPlaceKind(category: Category, withFridge: boolean): PlaceKind {
  const kind = DEFAULT_PLACE[category];
  return kind !== 'fridge' || withFridge ? kind : (WITHOUT_FRIDGE[category] ?? 'pantry');
}
