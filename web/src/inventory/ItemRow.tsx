// One thing in a list (a place, "Brug snart", search): its name; under it the place (where the list
// mixes places) and size, and its date if it has one; at the right, how many (Shelfwise's value
// column, S-024). Tapping it opens its sheet.

import { ButtonRow, RowLine } from '../components/ui';
import type { Lang, Strings } from '../i18n/strings';
import { DateShort } from '../keeping/DateInfo';
import { itemKeeping } from '../keeping/itemKeeping';
import type { Item } from './model';
import { useInventory } from './store';
import { sizeLine } from './summary';

export function ItemRow({ item, place, today, onOpen, lang, s }: { item: Item; place?: string; today: string; onOpen: (id: string) => void; lang: Lang; s: Strings }) {
  const { urgency } = itemKeeping(item, today, useInventory().places);
  const line = [place, sizeLine(item, lang, s)].filter(Boolean).join(' · ');
  return (
    <li>
      <ButtonRow
        onClick={() => onOpen(item.id)}
        title={item.name}
        subtitle={
          <>
            {line ? <RowLine>{line}</RowLine> : null}
            <DateShort item={item} urgency={urgency} today={today} lang={lang} s={s} />
          </>
        }
        value={
          <span className="shrink-0 text-right">
            <span aria-hidden="true" className="block text-xl font-medium tracking-[-0.045em] tabular-nums">
              {item.count}
            </span>
            <span className="sr-only">{s.itemCount(item.count)}</span>
          </span>
        }
      />
    </li>
  );
}
