// Søg (S-024): a sheet from the menu that searches everything, across places. The field takes
// focus when it opens (the user asked to search). A result opens the thing's sheet on top, and
// closing that comes back to the results.

import { useState } from 'react';
import { MessageState, RowList, SearchField } from '../components/ui';
import { Sheet, SheetHeader } from '../components/sheet';
import { today } from '../i18n/format';
import type { Lang, Strings } from '../i18n/strings';
import { placeName } from '../places';
import { ItemRow } from './ItemRow';
import { searchItems } from './search';
import { useInventory } from './store';

const TITLE_ID = 'search-sheet-title';

export function SearchSheet({ open, onClose, onOpenThing, lang, s }: { open: boolean; onClose: () => void; onOpenThing: (id: string) => void; lang: Lang; s: Strings }) {
  const { items, places } = useInventory();
  const [query, setQuery] = useState('');
  const searching = query.trim() !== '';
  const results = searching ? searchItems(items, query, (i) => [placeName(places, i.placeId, s), s.categories[i.category]]) : [];
  const day = today();
  return (
    <Sheet open={open} onClose={onClose} labelledBy={TITLE_ID}>
      <SheetHeader id={TITLE_ID} title={s.searchTitle} closeLabel={s.close} onClose={onClose}>
        <div className="mt-3">
          <SearchField id="search-sheet-field" value={query} onChange={setQuery} placeholder={s.searchPlaceholder} label={s.searchLabel} clearLabel={s.clearSearch} autofocus />
        </div>
      </SheetHeader>
      <div className="min-h-[40vh] pt-3">
        {!searching ? null : results.length === 0 ? (
          <MessageState title={s.noMatches(query.trim())} />
        ) : (
          <RowList label={s.searchLabel}>
            {results.map((item) => (
              <ItemRow key={item.id} item={item} place={placeName(places, item.placeId, s)} today={day} onOpen={onOpenThing} lang={lang} s={s} />
            ))}
          </RowList>
        )}
      </div>
    </Sheet>
  );
}
