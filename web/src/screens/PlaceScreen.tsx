// One place (Køleskab, Fryser, Skab): its things grouped by category (S-005), each opening its sheet;
// "Scan" and "Tilføj" add straight to this place.

import { ChevronRight, Plus, ScanBarcode } from 'lucide-react';
import { useState } from 'react';
import { ButtonLink, Button, MessageState, Page, SubPageHeader, Toast, type ToastMessage } from '../components/ui';
import type { Lang, Strings } from '../i18n/strings';
import { AddSheet } from '../inventory/AddSheet';
import { CATEGORIES } from '../inventory/categories';
import { ItemSheet } from '../inventory/ItemSheet';
import { useInventory, useInventoryLoaded } from '../inventory/store';
import { itemSummary } from '../inventory/summary';
import { usePageTitle } from '../lib/usePageTitle';
import { placeName } from '../places';
import { hrefs } from '../router';

export function PlaceScreen({ id, lang, s }: { id: string; lang: Lang; s: Strings }) {
  const loaded = useInventoryLoaded();
  const items = useInventory().items.filter((i) => i.placeId === id);
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const title = placeName(id, s);
  usePageTitle(title, s.appTitle);
  const total = items.reduce((sum, i) => sum + i.count, 0);

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
      {!loaded ? (
        <MessageState title={s.loading} />
      ) : items.length === 0 ? (
        <MessageState title={s.emptyPlace} />
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
                    <li key={item.id}>
                      <button type="button" aria-haspopup="dialog" onClick={() => setOpenId(item.id)} className="flex min-h-14 w-full items-center gap-[12px] px-[20px] py-3 text-left">
                        <span className="flex-1">
                          <span className="block font-bold">{item.name}</span>
                          <span className="block text-sm text-muted">{itemSummary(item, lang, s)}</span>
                        </span>
                        <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
      <ItemSheet openId={openId} onClose={() => setOpenId(null)} onMessage={(text) => setToast({ id: Date.now(), text })} lang={lang} s={s} />
      <AddSheet open={adding} placeId={id} onClose={() => setAdding(false)} lang={lang} s={s} />
      <Toast message={toast} onHide={() => setToast(null)} />
    </Page>
  );
}
