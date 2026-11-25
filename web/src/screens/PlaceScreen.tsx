// One place: its things grouped by kind of food (S-005, S-021), each opening its sheet; a search
// within this place only (Søg in the menu searches everything). Scan and Tilføj in the menu start
// on this place without asking (S-024).

import { useRef, useState } from 'react';
import { MessageState, Page, RowList, SearchField, Section, SubPageHeader } from '../components/ui';
import { today } from '../i18n/format';
import type { Lang, Strings } from '../i18n/strings';
import { CATEGORIES } from '../inventory/categories';
import { ItemRow } from '../inventory/ItemRow';
import { searchItems } from '../inventory/search';
import { useInventory, useInventoryLoaded } from '../inventory/store';
import { totalCount } from '../inventory/summary';
import { useInventoryActions } from '../inventory/useInventoryActions';
import { usePageTitle } from '../lib/usePageTitle';
import { placeName } from '../places';
import { hrefs } from '../router';

export function PlaceScreen({ id, lang, s }: { id: string; lang: Lang; s: Strings }) {
  const loaded = useInventoryLoaded();
  const { items: all, places } = useInventory();
  const items = all.filter((i) => i.placeId === id);
  const [query, setQuery] = useState('');
  const title = placeName(places, id, s);
  const heading = useRef<HTMLHeadingElement>(null);
  usePageTitle(title, s.appTitle, heading);
  const { openThing, element } = useInventoryActions({ placeId: id, lang, s });
  const day = today();
  const searching = query.trim() !== '';
  const results = searching ? searchItems(items, query, (i) => [s.categories[i.category]]) : [];

  return (
    <Page nav>
      <SubPageHeader backLabel={s.back} backTo={hrefs.home} title={title} subtitle={<span className="font-mono text-sm">{s.itemCount(totalCount(items))}</span>} headingRef={heading} />
      {items.length > 0 ? (
        <div className="mb-5">
          <SearchField id="place-search" value={query} onChange={setQuery} placeholder={s.searchIn(title)} label={s.searchIn(title)} clearLabel={s.clearSearch} />
        </div>
      ) : null}
      {!loaded ? (
        <MessageState title={s.loading} />
      ) : items.length === 0 ? (
        <MessageState title={s.emptyPlace} />
      ) : searching ? (
        results.length === 0 ? (
          <MessageState title={s.noMatches(query.trim())} />
        ) : (
          <RowList label={s.searchIn(title)}>
            {results.map((item) => (
              <ItemRow key={item.id} item={item} today={day} onOpen={openThing} lang={lang} s={s} />
            ))}
          </RowList>
        )
      ) : (
        <div className="flex flex-col gap-5">
          {CATEGORIES.map((c) => {
            const inCategory = items.filter((i) => i.category === c).sort((a, b) => a.name.localeCompare(b.name, lang));
            if (inCategory.length === 0) return null;
            return (
              <Section key={c} id={`cat-${c}`} title={s.categories[c]} count={totalCount(inCategory)}>
                <RowList>
                  {inCategory.map((item) => (
                    <ItemRow key={item.id} item={item} today={day} onOpen={openThing} lang={lang} s={s} />
                  ))}
                </RowList>
              </Section>
            );
          })}
        </div>
      )}
      {element}
    </Page>
  );
}
