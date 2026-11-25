// Steder (S-013, S-019, S-022): the household's places, each with a kind (Frost, Køl, Tørvarer) that
// decides how its dates are given (a day in the fridge, a month elsewhere). Alphabetical until the
// user moves one: dragging (touch: hold the handle; mouse; keyboard: space, arrows, space) or "Flyt
// op" / "Flyt ned" in a place's sheet makes the order their own, and "Sortér alfabetisk" goes back.
// No selector for it. Add, rename, change the kind of, or delete a place; deleting one with things
// in it asks where they should go first, and the last place cannot be deleted.

import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, closestCenter, useSensor, useSensors, type Announcements, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowDown, ArrowDownAZ, ArrowUp, ChevronRight, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { Bubble, Button, Choice, Page, Sheet, SheetHeader, SubPageHeader, Toast, fieldClass, rowListClass, useConfirm, type ToastMessage } from '../components/ui';
import type { Strings } from '../i18n/strings';
import { useOrderedPlaces } from '../inventory/orderedPlaces';
import { PlaceField } from '../inventory/PlaceField';
import { PLACE_ICON } from '../inventory/placeIcons';
import { inventory, useInventory } from '../inventory/store';
import { usePageTitle } from '../lib/usePageTitle';
import { PLACE_KINDS, placeName, placeOf, type Place, type PlaceKind } from '../places';
import { hrefs } from '../router';
import { setPreference, usePreferences } from '../settings/preferences';

const TITLE_ID = 'place-sheet-title';

// A new order, from a move: the places as shown, with one moved. From then on the order is the
// user's own (S-022), so nothing jumps: the alphabetical order shown is where it starts.
function reorder(ids: string[]) {
  inventory.reorderPlaces(ids);
  setPreference('placeOrder', 'own');
}

export function PlacesScreen({ s }: { s: Strings }) {
  const t = s.placesScreen;
  usePageTitle(t.title, s.appTitle);
  const { items } = useInventory();
  const { placeOrder } = usePreferences();
  const ordered = useOrderedPlaces(s);
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const countIn = (id: string) => items.filter((i) => i.placeId === id).reduce((n, i) => n + i.count, 0);

  return (
    <Page>
      <SubPageHeader backLabel={s.back} backTo={hrefs.settings} title={t.title} />
      <div className="flex flex-col gap-4">
        <p>{t.intro}</p>
        <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-[12px]">
          <p className="text-sm text-muted">{t.orderHelp}</p>
          {placeOrder === 'own' ? (
            <button type="button" onClick={() => setPreference('placeOrder', 'alphabetical')} className="-mr-2 inline-flex min-h-11 items-center gap-[6px] px-[8px] text-sm font-semibold">
              <ArrowDownAZ aria-hidden="true" className="size-4" />
              {t.sortAlphabetical}
            </button>
          ) : null}
        </div>
        <SortablePlaces places={ordered} countIn={countIn} onOpen={setEditing} s={s} />
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
  return (
    <button type="button" aria-haspopup="dialog" onClick={() => onOpen(place.id)} className="flex min-h-16 w-full min-w-0 flex-1 items-center gap-[12px] py-3 text-left">
      <Bubble Icon={PLACE_ICON[place.kind]} />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold break-words">{placeName(places, place.id, s)}</span>
        <span className="block text-sm text-muted">
          {s.placeKinds[place.kind]} · <span className="font-mono text-xs">{s.itemCount(count)}</span>
        </span>
      </span>
      <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" />
    </button>
  );
}

// The places, each with a handle to drag it by.
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
  // What was last announced, so the same place is not announced twice in a row: picking a place up
  // also reports it as over its own spot, which would cut off "taget op" before it is read.
  const lastOver = useRef<string | number | null>(null);
  const announcements: Announcements = {
    onDragStart: ({ active }) => {
      lastOver.current = active.id;
      return t.dnd.picked(nameOf(active.id), positionOf(active.id), ids.length);
    },
    onDragOver: ({ active, over }) => {
      if (!over || over.id === lastOver.current) return undefined;
      lastOver.current = over.id;
      return t.dnd.over(nameOf(active.id), positionOf(over.id), ids.length);
    },
    onDragEnd: ({ active, over }) => (over ? t.dnd.dropped(nameOf(active.id), positionOf(over.id), ids.length) : t.dnd.cancelled(nameOf(active.id))),
    onDragCancel: ({ active }) => t.dnd.cancelled(nameOf(active.id)),
  };
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    reorder(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))));
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} accessibility={{ announcements, screenReaderInstructions: { draggable: t.dnd.instructions } }}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className={rowListClass}>
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
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`flex items-center gap-[4px] ${isDragging ? 'relative z-10 rounded-card bg-surface shadow-[0_8px_24px_rgb(16_43_36/0.16)]' : ''}`}>
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={s.placesScreen.dragHandle(placeName(places, place.id, s))}
        className="-ml-[10px] grid size-11 shrink-0 cursor-grab touch-none place-items-center self-center rounded-full text-muted"
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
    reorder(arrayMove(ids, index, index + by));
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
      <div className="flex flex-col gap-5 pt-4">
        {removing && place ? (
          <div className="flex flex-col gap-4" role="group" aria-label={t.removeConfirm(shownName(place.id))}>
            <p className="text-lg font-bold">{t.removeConfirm(shownName(place.id))}</p>
            <p>{t.hasThings(inIt)}</p>
            <PlaceField name="place-move-to" legend={t.moveTo} value={moveTo} onChange={setMoveTo} places={others} s={s} />
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
            <Button variant="secondary" onClick={() => setRemoving(false)}>
              {s.cancel}
            </Button>
          </div>
        ) : (
          <form onSubmit={save} className="flex flex-col gap-5">
            <label className="flex flex-col gap-1">
              <span className="mb-1 font-semibold">{t.name}</span>
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
            {place ? (
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
