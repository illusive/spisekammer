// Search across everything you have (S-006): a thing matches when every word of the query is found
// in its name, brand, category or place, anywhere in a word (Danish joins words: "mælk" finds
// "Letmælk"), case and accents ignored. Name matches come first. Pure.

import { fold } from '../lib/fold';
import type { Item } from './model';

const words = (text: string) => fold(text).split(/[^\p{L}\p{N}]+/u).filter(Boolean);

export function searchItems(items: Item[], query: string, labelsOf: (item: Item) => string[]): Item[] {
  const q = words(query);
  if (q.length === 0) return [];
  const scored: { item: Item; inName: boolean }[] = [];
  for (const item of items) {
    const nameWords = words(item.name);
    const all = [...nameWords, ...words(item.brand ?? ''), ...labelsOf(item).flatMap(words)];
    if (!q.every((w) => all.some((x) => x.includes(w)))) continue;
    scored.push({ item, inName: q.every((w) => nameWords.some((x) => x.includes(w))) });
  }
  return scored.sort((a, b) => Number(b.inName) - Number(a.inName) || a.item.name.localeCompare(b.item.name, 'da')).map((s) => s.item);
}
