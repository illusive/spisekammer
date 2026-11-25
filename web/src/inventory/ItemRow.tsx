// One thing in a list (a place, search results, "Brug snart"): its name, a line about it, and its
// date if it has one; tapping it opens its sheet.

import { ChevronRight } from 'lucide-react';
import type { Lang, Strings } from '../i18n/strings';
import { DateShort } from '../keeping/DateInfo';
import { itemKeeping } from '../keeping/itemKeeping';
import type { Item } from './model';
import { useInventory } from './store';
import { itemSummary } from './summary';

export function ItemRow({ item, prefix, today, onOpen, lang, s }: { item: Item; prefix?: string; today: string; onOpen: (id: string) => void; lang: Lang; s: Strings }) {
  const info = itemKeeping(item, today, useInventory().places);
  return (
    <li>
      <button type="button" aria-haspopup="dialog" onClick={() => onOpen(item.id)} className="flex min-h-16 w-full items-center gap-[12px] py-3 text-left">
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{item.name}</span>
          <span className="block text-sm text-muted">{prefix ? `${prefix} · ${itemSummary(item, lang, s)}` : itemSummary(item, lang, s)}</span>
          <DateShort item={item} urgency={info.urgency} today={today} lang={lang} s={s} />
        </span>
        <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" />
      </button>
    </li>
  );
}
