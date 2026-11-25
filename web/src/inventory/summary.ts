// One line about a thing: how many and its size, e.g. "2 · 1 l" or "4 · 400 g".

import type { Lang, Strings } from '../i18n/strings';
import type { Item } from './model';
import { formatSize } from './size';

export function itemSummary(item: Item, lang: Lang, s: Strings): string {
  const size = item.amount && item.unit ? formatSize({ amount: item.amount, unit: item.unit }, lang, (u) => s.units[u]) : item.sizeText;
  return [s.itemCount(item.count), size].filter(Boolean).join(' · ');
}
