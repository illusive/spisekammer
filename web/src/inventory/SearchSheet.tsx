// Søg (S-024): a sheet from the menu that searches everything, across places. The field spans the
// sheet's width under its title and takes focus when it opens (the user asked to search). Results
// are grouped under their place, in the user's order, each group headed by the place's icon and
// name, so where a thing is kept is the first thing seen. A result opens the thing's sheet on top,
// and closing that comes back to the results.

import { useState } from 'react';
import { MessageState, RowList, SearchField } from '../components/ui';
import { Sheet, SheetHeader } from '../components/sheet';
import { today } from '../i18n/format';
import type { Lang, Strings } from '../i18n/strings';
import { labelOf, placeName } from '../places';
import { ItemRow } from './ItemRow';
import { useOrderedPlaces } from './orderedPlaces';
import { PLACE_ICON } from './placeIcons';
import { searchItems } from './search';
import { useInventory } from './store';
import { totalCount } from './summary';

const TITLE_ID = 'search-sheet-title';

export function SearchSheet({ open, onClose, onOpenThing, lang, s }: { open: boolean; onClose: () => void; onOpenThing: (id: string) => void; lang: Lang; s: Strings }) {
  const { items, places } = useInventory();
  const ordered = useOrderedPlaces(s);
  const [query, setQuery] = useState('');
  const searching = query.trim() !== '';
  const results = searching ? searchItems(items, query, (i) => [placeName(places, i.placeId, s), s.categories[i.category]]) : [];
  // In the order the places are listed; within a place, best match first (searchItems' order).
  const groups = ordered.map((place) => ({ place, things: results.filter((i) => i.placeId === place.id) })).filter((g) => g.things.length > 0);
  const day = today();
  return (
    <Sheet open={open} onClose={onClose} labelledBy={TITLE_ID}>
      <SheetHeader
        id={TITLE_ID}
        title={s.searchTitle}
        closeLabel={s.close}
        onClose={onClose}
        below={<SearchField id="search-sheet-field" value={query} onChange={setQuery} placeholder={s.searchPlaceholder} label={s.searchLabel} clearLabel={s.clearSearch} autofocus />}
      />
      {/* Tall from the start, so the field stays where it is while results come and go. */}
      <div className="min-h-[65dvh] pt-2">
        {!searching ? null : groups.length === 0 ? (
          <div className="pt-2">
            <MessageState title={s.noMatches(query.trim())} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {groups.map(({ place, things }) => {
              const Icon = PLACE_ICON[place.kind];
              return (
                // The place heads its things, plainly: its icon and name, and how many match there.
                <section key={place.id} aria-labelledby={`search-${place.id}`} className="flex flex-col gap-1">
                  <div className="flex min-h-11 items-center gap-[10px]">
                    <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-soft text-on-soft">
                      <Icon className="size-4" strokeWidth={1.75} />
                    </span>
                    <h3 id={`search-${place.id}`} className="flex-1 font-semibold">
                      {labelOf(place, s)}
                    </h3>
                    <span className="font-mono text-xs text-muted">{s.itemCount(totalCount(things))}</span>
                  </div>
                  <RowList>
                    {things.map((item) => (
                      <ItemRow key={item.id} item={item} today={day} onOpen={onOpenThing} lang={lang} s={s} />
                    ))}
                  </RowList>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </Sheet>
  );
}
