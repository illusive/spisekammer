// Hjem (S-005, S-023): the wordmark and the gear, "Hvad har du?" with a search across everything,
// Scan and Tilføj, "Brug snart" (things whose date is near or past, across all places), then the
// places with how much is in each, and "Rediger" to Steder (S-020).

import { ChevronRight, Pencil, Plus, ScanBarcode } from 'lucide-react';
import { useState } from 'react';
import { Bubble, Button, MessageState, Page, SearchField, Section, SettingsButton, Toast, pageTitleClass, rowListClass, type ToastMessage } from '../components/ui';
import { today } from '../i18n/format';
import type { Lang, Strings } from '../i18n/strings';
import { AddSheet } from '../inventory/AddSheet';
import { ItemRow } from '../inventory/ItemRow';
import { ItemSheet } from '../inventory/ItemSheet';
import { useOrderedPlaces } from '../inventory/orderedPlaces';
import { PLACE_ICON } from '../inventory/placeIcons';
import { searchItems } from '../inventory/search';
import { useInventory, useInventoryLoaded } from '../inventory/store';
import { itemKeeping } from '../keeping/itemKeeping';
import { usePageTitle } from '../lib/usePageTitle';
import { placeName } from '../places';
import { hrefs } from '../router';

export function HomeScreen({ lang, s }: { lang: Lang; s: Strings }) {
  const { items, places: allPlaces } = useInventory();
  const loaded = useInventoryLoaded();
  const places = useOrderedPlaces(s);
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  usePageTitle('', s.appTitle);

  const searching = query.trim() !== '';
  const results = searching ? searchItems(items, query, (i) => [placeName(allPlaces, i.placeId, s), s.categories[i.category]]) : [];
  const day = today();
  // Use soon: past, today or within the place's window (rules.urgency), the earliest first.
  const soon = items
    .filter((item) => ['past', 'today', 'soon'].includes(itemKeeping(item, day, allPlaces).urgency))
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  const countIn = (placeId: string) => items.filter((i) => i.placeId === placeId).reduce((sum, i) => sum + i.count, 0);

  return (
    <Page>
      <header className="mb-5 flex items-center justify-between gap-[12px]">
        <p className="text-xl font-bold tracking-[-0.02em]">
          {s.appTitle.toLowerCase()}
          <span aria-hidden="true" className="text-sage">
            .
          </span>
        </p>
        <SettingsButton label={s.settingsOpen} />
      </header>

      <h1 className={`${pageTitleClass} mb-4 text-[2.25rem]`}>{s.homeTitle}</h1>
      <SearchField id="home-search" value={query} onChange={setQuery} placeholder={s.searchPlaceholder} label={s.searchLabel} clearLabel={s.clearSearch} />

      {searching ? (
        <section aria-label={s.searchLabel} className="mt-4">
          {results.length === 0 ? (
            <MessageState title={s.noMatches(query.trim())} />
          ) : (
            <ul className={rowListClass}>
              {results.map((item) => (
                <ItemRow key={item.id} item={item} prefix={placeName(allPlaces, item.placeId, s)} today={day} onOpen={setOpenId} lang={lang} s={s} />
              ))}
            </ul>
          )}
        </section>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Button variant="primary" onClick={() => (location.hash = hrefs.scan())}>
              <ScanBarcode aria-hidden="true" className="size-5" />
              {s.scan}
            </Button>
            <Button variant="secondary" aria-haspopup="dialog" onClick={() => setAdding(true)}>
              <Plus aria-hidden="true" className="size-5" />
              {s.add}
            </Button>
          </div>
          {loaded && items.length === 0 ? <p className="mt-4 text-center text-muted">{s.emptyHome}</p> : null}

          {soon.length > 0 ? (
            <Section
              id="use-soon"
              title={s.keep.useSoon}
              aside={<span className="font-mono text-xs text-muted">{soon.length}</span>}
              className="mt-7"
            >
              <ul className={rowListClass}>
                {soon.map((item) => (
                  <ItemRow key={item.id} item={item} prefix={placeName(allPlaces, item.placeId, s)} today={day} onOpen={setOpenId} lang={lang} s={s} />
                ))}
              </ul>
            </Section>
          ) : null}

          <Section
            id="places"
            title={s.places}
            className="mt-7"
            aside={
              // Steder from Hjem (S-020): add, rename, order or delete places.
              <a href={hrefs.places} aria-label={s.editPlaces.label} className="-mr-2 inline-flex min-h-11 items-center gap-[6px] px-[8px] text-sm font-semibold">
                <Pencil aria-hidden="true" className="size-4" />
                {s.editPlaces.text}
              </a>
            }
          >
            <ul className={rowListClass}>
              {places.map((place) => (
                <li key={place.id}>
                  <a href={hrefs.place(place.id)} className="flex min-h-16 items-center gap-[12px] py-3">
                    <Bubble Icon={PLACE_ICON[place.kind]} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold break-words">{placeName(allPlaces, place.id, s)}</span>
                      <span className="block font-mono text-xs text-muted">{loaded ? s.itemCount(countIn(place.id)) : s.loading}</span>
                    </span>
                    <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" />
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        </>
      )}
      <ItemSheet openId={openId} onClose={() => setOpenId(null)} onMessage={(text) => setToast({ id: Date.now(), text })} lang={lang} s={s} />
      {adding ? <AddSheet open placeId={null} onClose={() => setAdding(false)} lang={lang} s={s} /> : null}
      <Toast message={toast} onHide={() => setToast(null)} />
    </Page>
  );
}
