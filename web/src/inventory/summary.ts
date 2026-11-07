// One line about a thing: how many, its size and its brand, e.g. "2 · 1 l · Arla".

import type { Lang, Strings } from '../i18n/strings';
import type { Item } from './model';
import { formatSize } from './size';

export function itemSummary(item: Item, lang: Lang, s: Strings): string {
  const size = item.amount && item.unit ? formatSize({ amount: item.amount, unit: item.unit }, lang, (u) => (u === 'stk' ? (lang === 'da' ? 'stk.' : 'pcs') : u)) : item.sizeText;
  return [s.itemCount(item.count), size, item.brand].filter(Boolean).join(' · ');
}
