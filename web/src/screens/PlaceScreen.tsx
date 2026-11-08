// One place: its things grouped by category (S-005), each opening its sheet; a search within this
// place only (Hjem searches everything, S-015); "Scan" and "Tilføj" add straight to this place.

import { Plus, ScanBarcode } from 'lucide-react';
import { useState } from 'react';
import { ButtonLink, Button, MessageState, Page, SearchField, SubPageHeader, Toast, type ToastMessage } from '../components/ui';
import { today } from '../i18n/format';
import type { Lang, Strings } from '../i18n/strings';
import { AddSheet } from '../inventory/AddSheet';
import { CATEGORIES } from '../inventory/categories';
import { ItemRow } from '../inventory/ItemRow';
import { ItemSheet } from '../inventory/ItemSheet';
import { searchItems } from '../inventory/search';
import { useInventory, useInventoryLoaded } from '../inventory/store';
import { usePageTitle } from '../lib/usePageTitle';
import { placeName } from '../places';
import { hrefs } from '../router';

export function PlaceScreen({ id, lang, s }: { id: string; lang: Lang; s: Strings }) {
  const loaded = useInventoryLoaded();
  const { items: all, places } = useInventory();
  const items = all.filter((i) => i.placeId === id);
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [query, setQuery] = useState('');
  const title = placeName(places, id, s);
  usePageTitle(title, s.appTitle);
  const total = items.reduce((sum, i) => sum + i.count, 0);
  const day = today();
  const searching = query.trim() !== '';
  const results = searching ? searchItems(items, query, (i) => [s.categories[i.category]]) : [];

  return (
    <Page>
      <SubPageHeader backLabel={s.back} backTo={hrefs.home} title={title} subtitle={s.itemCount(total)} />
      <div className="mb-4 grid grid-cols-2 gap-3">
        <ButtonLink variant="primary" href={hrefs.scan(id)}>
          <ScanBarcode aria-hidden="true" className="size-5" />
          {s.scan}
        </ButtonLink>
        <Button variant="ink" onClick={() => setAdding(true)}>
          <Plus aria-hidden="true" className="size-5" />
          {s.add}
        </Button>
      </div>
      {items.length > 0 ? (
        <div className="mb-4">
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
          <ul aria-label={s.searchIn(title)} className="flex flex-col divide-y divide-border rounded-card bg-surface">
            {results.map((item) => (
              <ItemRow key={item.id} item={item} today={day} onOpen={setOpenId} lang={lang} s={s} />
            ))}
          </ul>
        )
      ) : (
        <div className="flex flex-col gap-5">
          {CATEGORIES.map((c) => {
            const inCategory = items.filter((i) => i.category === c).sort((a, b) => a.name.localeCompare(b.name, lang));
            if (inCategory.length === 0) return null;
            return (
              <section key={c} aria-labelledby={`cat-${c}`} className="flex flex-col gap-2">
                <h2 id={`cat-${c}`} className="px-1 text-lg font-bold">
                  {s.categories[c]}
                </h2>
                <ul className="flex flex-col divide-y divide-border rounded-card bg-surface">
                  {inCategory.map((item) => (
                    <ItemRow key={item.id} item={item} today={day} onOpen={setOpenId} lang={lang} s={s} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
      <ItemSheet openId={openId} onClose={() => setOpenId(null)} onMessage={(text) => setToast({ id: Date.now(), text })} lang={lang} s={s} />
      {adding ? <AddSheet open placeId={id} onClose={() => setAdding(false)} lang={lang} s={s} /> : null}
      <Toast message={toast} onHide={() => setToast(null)} />
    </Page>
  );
}
