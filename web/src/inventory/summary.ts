// One line about a thing: how many and its size, e.g. "2 · 1 l" or "4 · 400 g".

import type { Lang, Strings } from '../i18n/strings';
import type { Item } from './model';
import { formatSize } from './size';

// Its size, "400 g" or the size as written, or '' without one.
export function sizeLine(item: Pick<Item, 'amount' | 'unit' | 'sizeText'>, lang: Lang, s: Strings): string {
  return item.amount && item.unit ? formatSize({ amount: item.amount, unit: item.unit }, lang, (u) => s.units[u]) : (item.sizeText ?? '');
}

export function itemSummary(item: Item, lang: Lang, s: Strings): string {
  return [s.itemCount(item.count), sizeLine(item, lang, s)].filter(Boolean).join(' · ');
}

// How many things in all (the count of each line added up).
export const totalCount = (items: Pick<Item, 'count'>[]) => items.reduce((sum, i) => sum + i.count, 0);

// How many things in each place, in one pass.
export function countsByPlace(items: Pick<Item, 'count' | 'placeId'>[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const i of items) counts.set(i.placeId, (counts.get(i.placeId) ?? 0) + i.count);
  return counts;
}
