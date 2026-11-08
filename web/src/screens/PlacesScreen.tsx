// Steder (S-013): the household's places, each with a kind (Frost, Køl, Tørvarer) that decides the
// keeping times. Add one, rename it, change its kind, or delete it; deleting a place with things in
// it asks where they should go first, and the last place cannot be deleted.

import { ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button, Choice, Page, Sheet, SheetHeader, SubPageHeader, Toast, inputClass, useConfirm, type ToastMessage } from '../components/ui';
import type { Strings } from '../i18n/strings';
import { PLACE_ICON } from '../inventory/placeIcons';
import { inventory, useInventory } from '../inventory/store';
import { usePageTitle } from '../lib/usePageTitle';
import { PLACE_KINDS, placeName, placeOf, sortPlaces, type PlaceKind } from '../places';
import { hrefs } from '../router';

const TITLE_ID = 'place-sheet-title';

export function PlacesScreen({ s }: { s: Strings }) {
  const t = s.placesScreen;
  usePageTitle(t.title, s.appTitle);
  const { items, places } = useInventory();
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const countIn = (id: string) => items.filter((i) => i.placeId === id).reduce((n, i) => n + i.count, 0);

  return (
    <Page>
      <SubPageHeader backLabel={s.back} backTo={hrefs.settings} title={t.title} />
      <div className="flex flex-col gap-4">
        <p className="px-1">{t.intro}</p>
        <ul className="flex flex-col divide-y divide-border rounded-card bg-surface">
          {sortPlaces(places).map((place) => {
            const Icon = PLACE_ICON[place.kind];
            return (
              <li key={place.id}>
                <button type="button" aria-haspopup="dialog" onClick={() => setEditing(place.id)} className="flex min-h-16 w-full items-center gap-[14px] px-[18px] py-3 text-left">
                  <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-soft text-on-soft">
                    <Icon className="size-6" strokeWidth={1.75} />
                  </span>
                  <span className="flex-1">
                    <span className="block font-bold">{placeName(places, place.id, s)}</span>
                    <span className="block text-sm text-muted">
                      {s.placeKinds[place.kind]} · {s.itemCount(countIn(place.id))}
                    </span>
                  </span>
                  <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" />
                </button>
              </li>
            );
          })}
        </ul>
        <Button variant="primary" onClick={() => setEditing('new')}>
          <Plus aria-hidden="true" className="size-5" />
          {t.add}
        </Button>
      </div>
      <Sheet open={editing !== null} onClose={() => setEditing(null)} labelledBy={TITLE_ID} dismissOnBackdrop={false}>
        {editing !== null ? <PlaceSheet key={editing} placeId={editing === 'new' ? null : editing} s={s} onDone={(text) => (setEditing(null), text && setToast({ id: Date.now(), text }))} /> : null}
      </Sheet>
      <Toast message={toast} onHide={() => setToast(null)} />
    </Page>
  );
}

function PlaceSheet({ placeId, s, onDone }: { placeId: string | null; s: Strings; onDone: (message?: string) => void }) {
  const t = s.placesScreen;
  const { items, places } = useInventory();
  const place = placeId ? placeOf(places, placeId) : undefined;
  const [name, setName] = useState(place?.name ?? '');
  const [kind, setKind] = useState<PlaceKind>(place?.kind ?? 'freezer');
  const [removing, setRemoving] = useState(false);
  const others = sortPlaces(places).filter((p) => p.id !== placeId);
  const [moveTo, setMoveTo] = useState(others[0]?.id ?? '');
  const { confirm, sheet } = useConfirm();
  const inIt = placeId ? items.filter((i) => i.placeId === placeId).length : 0;
  // A preset place keeps its own name when the field is left empty; a new place needs one.
  const shownName = (id: string) => placeName(inventory.get().places, id, s);

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!place) {
      if (!name.trim()) return;
      const id = inventory.addPlace(name, kind);
      onDone(t.added(shownName(id)));
    } else {
      inventory.updatePlace(place.id, { name, kind });
      onDone(t.saved(shownName(place.id)));
    }
  };

  const remove = async () => {
    if (!place) return;
    const label = shownName(place.id);
    if (inIt > 0) {
      setRemoving(true);
      return;
    }
    if (!(await confirm({ title: t.removeConfirm(label), body: s.cannotUndo, confirmLabel: t.remove, cancelLabel: s.cancel, danger: true }))) return;
    inventory.removePlace(place.id, null);
    onDone(t.removed(label));
  };

  return (
    <>
      <SheetHeader id={TITLE_ID} title={place ? shownName(place.id) : t.addTitle} closeLabel={s.close} onClose={() => onDone()} />
      <div className="mt-4 flex flex-col gap-5 rounded-card bg-surface px-[20px] py-5">
        {removing && place ? (
          <div className="flex flex-col gap-4" role="group" aria-label={t.removeConfirm(shownName(place.id))}>
            <p className="text-lg font-bold">{t.removeConfirm(shownName(place.id))}</p>
            <p>{t.hasThings(inIt)}</p>
            <Choice name="place-move-to" legend={t.moveTo} value={moveTo} onChange={setMoveTo} options={others.map((p) => ({ value: p.id, label: shownName(p.id) }))} />
            <Button
              variant="danger"
              onClick={() => {
                const label = shownName(place.id);
                inventory.removePlace(place.id, moveTo);
                onDone(t.removed(label));
              }}
            >
              {t.moveAndRemove}
            </Button>
            <Button variant="onPage" onClick={() => setRemoving(false)}>
              {s.cancel}
            </Button>
          </div>
        ) : (
          <form onSubmit={save} className="flex flex-col gap-5">
            <label className="flex flex-col gap-1">
              <span className="font-bold">{t.name}</span>
              <input
                required={!place}
                maxLength={40}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={place && !place.name ? shownName(place.id) : t.namePlaceholder}
                data-autofocus={place ? undefined : ''}
                autoComplete="off"
                className={`${inputClass} min-h-12 text-lg`}
              />
            </label>
            <div className="flex flex-col gap-2">
              <Choice<PlaceKind> name="place-kind" legend={t.kind} value={kind} onChange={setKind} options={PLACE_KINDS.map((k) => ({ value: k, label: s.placeKinds[k] }))} />
              <p className="text-sm text-muted">{s.placeKindHints[kind]}</p>
            </div>
            <Button type="submit" variant="primary" disabled={!place && !name.trim()}>
              {place ? t.save : t.add}
            </Button>
            {place ? (
              places.length > 1 ? (
                <Button variant="danger" onClick={() => void remove()}>
                  <Trash2 aria-hidden="true" className="size-5" />
                  {t.remove}
                </Button>
              ) : (
                <p className="text-sm text-muted">{t.lastPlace}</p>
              )
            ) : null}
          </form>
        )}
      </div>
      {sheet}
    </>
  );
}
