// "Hvor skal tingene hen?" (S-015): before adding or scanning from Hjem, the place is chosen once,
// and then things are added one after another to it. From a place's own page it is already known.

import { ChevronRight } from 'lucide-react';
import { Sheet, SheetHeader } from '../components/ui';
import type { Strings } from '../i18n/strings';
import { placeName } from '../places';
import { useOrderedPlaces } from './orderedPlaces';
import { PLACE_ICON } from './placeIcons';
import { useInventory } from './store';

const TITLE_ID = 'place-picker-title';

export function PlaceList({ onPick, s }: { onPick: (placeId: string) => void; s: Strings }) {
  const { items, places } = useInventory();
  const ordered = useOrderedPlaces(s);
  const countIn = (id: string) => items.filter((i) => i.placeId === id).reduce((n, i) => n + i.count, 0);
  return (
    <ul className="flex flex-col divide-y divide-border rounded-card bg-surface">
      {ordered.map((place) => {
        const Icon = PLACE_ICON[place.kind];
        return (
          <li key={place.id}>
            <button type="button" onClick={() => onPick(place.id)} className="flex min-h-16 w-full items-center gap-[14px] px-[18px] py-3 text-left">
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
  );
}

export function PlacePicker({ open, onPick, onClose, s }: { open: boolean; onPick: (placeId: string) => void; onClose: () => void; s: Strings }) {
  return (
    <Sheet open={open} onClose={onClose} labelledBy={TITLE_ID}>
      <SheetHeader id={TITLE_ID} title={s.pickPlace.title} closeLabel={s.close} onClose={onClose} autofocus>
        <p className="mt-1 text-sm text-muted">{s.pickPlace.hint}</p>
      </SheetHeader>
      <div className="mt-4">
        <PlaceList onPick={onPick} s={s} />
      </div>
    </Sheet>
  );
}
