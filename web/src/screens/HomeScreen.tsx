// Hjem (S-005): search across everything on top, Scan and Tilføj, "Brug snart" (what to use soon,
// across all places, S-010), then the places with how much is in each.

import { Archive, ChevronRight, Plus, Refrigerator, ScanBarcode, Snowflake, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Button, ButtonLink, MessageState, Page, SearchField, SettingsButton, Toast, type ToastMessage } from '../components/ui';
import { today } from '../i18n/format';
import type { Lang, Strings } from '../i18n/strings';
import { AddSheet } from '../inventory/AddSheet';
import { ItemRow } from '../inventory/ItemRow';
import { ItemSheet } from '../inventory/ItemSheet';
import { searchItems } from '../inventory/search';
import { useInventory, useInventoryLoaded } from '../inventory/store';
import { itemKeeping } from '../keeping/itemKeeping';
import { usePageTitle } from '../lib/usePageTitle';
import { useShownPlaces } from '../inventory/shownPlaces';
import { placeName, type PlaceKind } from '../places';
import { hrefs } from '../router';

export const PLACE_ICON: Record<PlaceKind, LucideIcon> = { fridge: Refrigerator, freezer: Snowflake, pantry: Archive };

export function HomeScreen({ lang, s }: { lang: Lang; s: Strings }) {
  const { items } = useInventory();
  const loaded = useInventoryLoaded();
  const places = useShownPlaces();
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  usePageTitle('', s.appTitle);

  const searching = query.trim() !== '';
  const results = searching ? searchItems(items, query, (i) => [placeName(i.placeId, s), s.categories[i.category]]) : [];
  const day = today();
  // Use soon: past, today or within the place's window (rules.urgency), the earliest first.
  const soon = items
    .map((item) => ({ item, info: itemKeeping(item, day) }))
    .filter(({ info }) => info.urgency === 'past' || info.urgency === 'today' || info.urgency === 'soon')
    .sort((a, b) => (a.info.keeping.by ?? '').localeCompare(b.info.keeping.by ?? ''))
    .map(({ item }) => item);
  const countIn = (placeId: string) => items.filter((i) => i.placeId === placeId).reduce((sum, i) => sum + i.count, 0);

  return (
    <Page>
      <header className="mt-2 mb-4 flex items-center justify-between gap-[12px] px-1">
        <p className="text-xl font-bold tracking-tight">{s.appTitle}</p>
        <SettingsButton label={s.settingsOpen} />
      </header>

      <section className="rounded-hero bg-accent px-[20px] pt-5 pb-6 text-on-accent">
        <h1 className="mb-5 text-[min(2.25rem,10vw)] leading-tight font-bold tracking-tight">{s.homeTitle}</h1>
        <SearchField id="home-search" value={query} onChange={setQuery} placeholder={s.searchPlaceholder} label={s.searchLabel} clearLabel={s.clearSearch} />
      </section>

      {searching ? (
        <section aria-label={s.searchLabel} className="mt-4">
          {results.length === 0 ? (
            <MessageState title={s.noMatches(query.trim())} />
          ) : (
            <ul className="flex flex-col divide-y divide-border rounded-card bg-surface">
              {results.map((item) => (
                <ItemRow key={item.id} item={item} prefix={placeName(item.placeId, s)} today={day} onOpen={setOpenId} lang={lang} s={s} />
              ))}
            </ul>
          )}
        </section>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <ButtonLink variant="primary" href={hrefs.scan()}>
              <ScanBarcode aria-hidden="true" className="size-5" />
              {s.scan}
            </ButtonLink>
            <Button variant="ink" onClick={() => setAdding(true)}>
              <Plus aria-hidden="true" className="size-5" />
              {s.add}
            </Button>
          </div>
          {loaded && items.length === 0 ? <p className="mt-4 px-1 text-center text-muted">{s.emptyHome}</p> : null}

          {soon.length > 0 ? (
            <section aria-labelledby="use-soon" className="mt-6 flex flex-col gap-3">
              <h2 id="use-soon" className="px-1 text-lg font-bold">
                {s.keep.useSoon}
              </h2>
              <ul className="flex flex-col divide-y divide-border rounded-card bg-surface">
                {soon.map((item) => (
                  <ItemRow key={item.id} item={item} prefix={placeName(item.placeId, s)} today={day} onOpen={setOpenId} lang={lang} s={s} />
                ))}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="places" className="mt-6 flex flex-col gap-3">
            <h2 id="places" className="px-1 text-lg font-bold">
              {s.places}
            </h2>
            <ul className={`grid grid-cols-1 gap-3 ${places.length > 2 ? 'min-[420px]:grid-cols-3' : 'min-[420px]:grid-cols-2'}`}>
              {places.map((place) => {
                const Icon = PLACE_ICON[place.kind];
                return (
                  <li key={place.id}>
                    <a href={hrefs.place(place.id)} className="flex min-h-16 items-center gap-[14px] rounded-card bg-surface px-[18px] py-4 min-[420px]:flex-col min-[420px]:items-start">
                      <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-soft text-on-soft">
                        <Icon className="size-6" strokeWidth={1.75} />
                      </span>
                      <span className="flex-1">
                        <span className="block font-bold">{s.placeKinds[place.kind]}</span>
                        <span className="block text-sm text-muted">{loaded ? s.itemCount(countIn(place.id)) : s.loading}</span>
                      </span>
                      <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted min-[420px]:hidden" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
      <ItemSheet openId={openId} onClose={() => setOpenId(null)} onMessage={(text) => setToast({ id: Date.now(), text })} lang={lang} s={s} />
      <AddSheet open={adding} placeId={null} onClose={() => setAdding(false)} lang={lang} s={s} />
      <Toast message={toast} onHide={() => setToast(null)} />
    </Page>
  );
}
