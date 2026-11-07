// The food types (S-009) and finding one from a product's name. The list ships with the app
// (food-types.json, built from FoodKeeper by scripts/build-food-types.ts), so it works offline.
//
// Matching: a key's words must each start a word of the name ("kylling" matches "Kyllingebryst"),
// in any order ("hakket oksekød" matches "Oksekød, hakket 8-12%"); a key starting with "=" must be
// the whole word ("=is" matches "Is", not "Isbjerg"). Small words (på, i, og …) are skipped. When
// several types match, the longest key wins, so "kyllingefond" beats "kylling". The user always
// sees the type that was picked and can change it.

import { fold } from '../lib/fold';
import data from './food-types.json';
import type { FoodType, FoodTypeData } from './types';

export const FOOD_TYPES: FoodType[] = (data as FoodTypeData).types;
export const FOOD_SOURCE = (data as FoodTypeData).source;

const byId = new Map(FOOD_TYPES.map((t) => [t.id, t]));
export const foodType = (id: string | undefined): FoodType | undefined => (id ? byId.get(id) : undefined);

const STOPWORDS = new Set(['på', 'i', 'og', 'af', 'til', 'of', 'in', 'and']);
const wordsOf = (text: string) => fold(text).split(/[^\p{L}\p{N}]+/u).filter(Boolean);

interface Key {
  words: { word: string; whole: boolean }[];
  score: number;
  type: FoodType;
}

let index: Key[] | null = null;

function keys(): Key[] {
  index ??= FOOD_TYPES.flatMap((type) =>
    type.keys.flatMap((raw) => {
      const whole = raw.startsWith('=');
      // A whole-word key is one word and kept as it is ("=and" is a duck, not the English "and").
      const words = (whole ? wordsOf(raw.slice(1)) : wordsOf(raw).filter((w) => !STOPWORDS.has(w))).map((word) => ({ word, whole }));
      if (words.length === 0) return []; // a key of only small words would match every name
      return [{ words, score: words.reduce((n, w) => n + w.word.length, 0) + (words.length - 1) * 0.5, type }];
    }),
  );
  return index;
}

export function matchFoodType(name: string): FoodType | undefined {
  const words = wordsOf(name);
  if (words.length === 0) return undefined;
  let best: Key | undefined;
  for (const key of keys()) {
    if (best && key.score <= best.score) continue;
    const found = key.words.every((k) => words.some((w) => (k.whole ? w === k.word : w.startsWith(k.word))));
    if (found) best = key;
  }
  return best?.type;
}

export const foodTypeName = (type: FoodType, lang: 'da' | 'en') => (lang === 'da' ? type.da : type.en);
