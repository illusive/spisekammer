// Steder (S-013, S-019): the household's places, each with a kind (Frost, Køl, Tørvarer) that
// decides the keeping times. Listed alphabetically, or in the user's own order, set by dragging
// (touch: hold the handle; mouse; keyboard: space, arrows, space) or with "Flyt op" / "Flyt ned" in
// a place's sheet. Add, rename, change the kind of, or delete a place; deleting one with things in
// it asks where they should go first, and the last place cannot be deleted.

import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, closestCenter, useSensor, useSensors, type Announcements, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowDown, ArrowUp, ChevronRight, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button, Choice, Page, Sheet, SheetHeader, SubPageHeader, Toast, fieldClass, useConfirm, type ToastMessage } from '../components/ui';
import type { Strings } from '../i18n/strings';
import { useOrderedPlaces } from '../inventory/orderedPlaces';
import { PLACE_ICON } from '../inventory/placeIcons';
import { inventory, useInventory } from '../inventory/store';
import { usePageTitle } from '../lib/usePageTitle';
import { PLACE_KINDS, orderPlaces, placeName, placeOf, type Place, type PlaceKind, type PlaceOrder } from '../places';
import { hrefs } from '../router';
import { readPreferences, setPreference, usePreferences } from '../settings/preferences';

const TITLE_ID = 'place-sheet-title';

export function PlacesScreen({ s }: { s: Strings }) {
  const t = s.placesScreen;
  usePageTitle(t.title, s.appTitle);
  const { items, places } = useInventory();
  const { placeOrder } = usePreferences();
  const ordered = useOrderedPlaces(s);
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const countIn = (id: string) => items.filter((i) => i.placeId === id).reduce((n, i) => n + i.count, 0);
  const own = placeOrder === 'own';

  // Switching to the own order starts from what is shown (alphabetical), so nothing jumps.
  const setOrder = (order: PlaceOrder) => {
    if (order === 'own' && readPreferences().placeOrder !== 'own') inventory.reorderPlaces(orderPlaces(inventory.get().places, 'alphabetical', s).map((p) => p.id));
    setPreference('placeOrder', order);
  };

  return (
    <Page>
      <SubPageHeader backLabel={s.back} backTo={hrefs.settings} title={t.title} />
      <div className="flex flex-col gap-4">
        <p className="px-1">{t.intro}</p>
        <div className="flex flex-col gap-2">
          <Choice<PlaceOrder> name="place-order" legend={t.order} value={placeOrder} onChange={setOrder} options={(['alphabetical', 'own'] as const).map((v) => ({ value: v, label: t.orderOptions[v] }))} />
          {own ? <p className="px-1 text-sm text-muted">{t.orderHelp}</p> : null}
        </div>
        {own ? (
          <SortablePlaces places={ordered} countIn={countIn} onOpen={setEditing} s={s} />
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-card bg-surface">
            {ordered.map((place) => (
              <li key={place.id}>
                <PlaceRow place={place} places={places} count={countIn(place.id)} onOpen={setEditing} s={s} />
              </li>
            ))}
          </ul>
        )}
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

function PlaceRow({ place, places, count, onOpen, s }: { place: Place; places: Place[]; count: number; onOpen: (id: string) => void; s: Strings }) {
  const Icon = PLACE_ICON[place.kind];
  return (
    <button type="button" aria-haspopup="dialog" onClick={() => onOpen(place.id)} className="flex min-h-16 w-full min-w-0 flex-1 items-center gap-[14px] px-[18px] py-3 text-left">
      <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-soft text-on-soft">
        <Icon className="size-6" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold break-words">{placeName(places, place.id, s)}</span>
        <span className="block text-sm text-muted">
          {s.placeKinds[place.kind]} · {s.itemCount(count)}
        </span>
      </span>
      <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" />
    </button>
  );
}

// The own order, by dragging a place's handle.
function SortablePlaces({ places, countIn, onOpen, s }: { places: Place[]; countIn: (id: string) => number; onOpen: (id: string) => void; s: Strings }) {
  const t = s.placesScreen;
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = places.map((p) => p.id);
  const nameOf = (id: string | number) => placeName(places, String(id), s);
  const positionOf = (id: string | number) => ids.indexOf(String(id)) + 1;
  const announcements: Announcements = {
    onDragStart: ({ active }) => t.dnd.picked(nameOf(active.id), positionOf(active.id), ids.length),
    onDragOver: ({ active, over }) => (over ? t.dnd.over(nameOf(active.id), positionOf(over.id), ids.length) : undefined),
    onDragEnd: ({ active, over }) => (over ? t.dnd.dropped(nameOf(active.id), positionOf(over.id), ids.length) : t.dnd.cancelled(nameOf(active.id))),
    onDragCancel: ({ active }) => t.dnd.cancelled(nameOf(active.id)),
  };
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    inventory.reorderPlaces(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))));
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} accessibility={{ announcements, screenReaderInstructions: { draggable: t.dnd.instructions } }}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col divide-y divide-border rounded-card bg-surface">
          {places.map((place) => (
            <SortableRow key={place.id} place={place} places={places} count={countIn(place.id)} onOpen={onOpen} s={s} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ place, places, count, onOpen, s }: { place: Place; places: Place[]; count: number; onOpen: (id: string) => void; s: Strings }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: place.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center ${isDragging ? 'relative z-10 rounded-card bg-surface shadow-lg' : ''}`}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={s.placesScreen.dragHandle(placeName(places, place.id, s))}
        className="grid size-11 shrink-0 cursor-grab touch-none place-items-center self-center rounded-full text-muted ml-[6px]"
      >
        <GripVertical aria-hidden="true" className="size-5" />
      </button>
      <PlaceRow place={place} places={places} count={count} onOpen={onOpen} s={s} />
    </li>
  );
}

function PlaceSheet({ placeId, s, onDone }: { placeId: string | null; s: Strings; onDone: (message?: string) => void }) {
  const t = s.placesScreen;
  const { items, places } = useInventory();
  const { placeOrder } = usePreferences();
  const ordered = useOrderedPlaces(s);
  const place = placeId ? placeOf(places, placeId) : undefined;
  const [name, setName] = useState(place?.name ?? '');
  const [kind, setKind] = useState<PlaceKind>(place?.kind ?? 'freezer');
  const [removing, setRemoving] = useState(false);
  const others = ordered.filter((p) => p.id !== placeId);
  const [moveTo, setMoveTo] = useState(others[0]?.id ?? '');
  const { confirm, sheet } = useConfirm();
  const inIt = placeId ? items.filter((i) => i.placeId === placeId).length : 0;
  // A preset place keeps its own name when the field is left empty; a new place needs one.
  const shownName = (id: string) => placeName(inventory.get().places, id, s);
  const index = placeId ? ordered.findIndex((p) => p.id === placeId) : -1;

  // "Flyt op" / "Flyt ned": the same as dragging, for VoiceOver and anyone who prefers buttons.
  const move = (by: -1 | 1) => {
    const ids = ordered.map((p) => p.id);
    if (index < 0 || index + by < 0 || index + by >= ids.length) return;
    inventory.reorderPlaces(arrayMove(ids, index, index + by));
  };

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
                autoComplete="off"
                className={fieldClass}
              />
            </label>
            <div className="flex flex-col gap-2">
              <Choice<PlaceKind> name="place-kind" legend={t.kind} value={kind} onChange={setKind} options={PLACE_KINDS.map((k) => ({ value: k, label: s.placeKinds[k] }))} />
              <p className="text-sm text-muted">{s.placeKindHints[kind]}</p>
            </div>
            <Button type="submit" variant="primary" disabled={!place && !name.trim()}>
              {place ? t.save : t.add}
            </Button>
            {place && placeOrder === 'own' ? (
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => move(-1)} disabled={index <= 0}>
                  <ArrowUp aria-hidden="true" className="size-5" />
                  {t.moveUp}
                </Button>
                <Button onClick={() => move(1)} disabled={index < 0 || index >= ordered.length - 1}>
                  <ArrowDown aria-hidden="true" className="size-5" />
                  {t.moveDown}
                </Button>
              </div>
            ) : null}
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
