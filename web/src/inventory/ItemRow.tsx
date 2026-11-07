// One thing in a list (a place, search results, "Brug snart"): its name, a line about it, and how
// long it keeps; tapping it opens its sheet.

import { ChevronRight } from 'lucide-react';
import type { Lang, Strings } from '../i18n/strings';
import { itemKeeping } from '../keeping/itemKeeping';
import { KeepShort } from '../keeping/KeepInfo';
import type { Item } from './model';
import { itemSummary } from './summary';

export function ItemRow({ item, prefix, today, onOpen, lang, s }: { item: Item; prefix?: string; today: string; onOpen: (id: string) => void; lang: Lang; s: Strings }) {
  const info = itemKeeping(item, today);
  return (
    <li>
      <button type="button" aria-haspopup="dialog" onClick={() => onOpen(item.id)} className="flex min-h-14 w-full items-center gap-[12px] px-[20px] py-3 text-left">
        <span className="flex-1">
          <span className="block font-bold">{item.name}</span>
          <span className="block text-sm text-muted">{prefix ? `${prefix} · ${itemSummary(item, lang, s)}` : itemSummary(item, lang, s)}</span>
          <KeepShort k={info.keeping} urgency={info.urgency} today={today} lang={lang} s={s} />
        </span>
        <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" />
      </button>
    </li>
  );
}
