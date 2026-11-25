// "Hvor lægger du ting?" (S-024): Scan and Tilføj from the menu ask once where things are going,
// and that place is preset for what follows (the form can still change it). One tap per place.

import { Bubble, ButtonRow, RowLine, RowList } from '../components/ui';
import { Sheet, SheetHeader } from '../components/sheet';
import type { Strings } from '../i18n/strings';
import { labelOf } from '../places';
import { usePreferences } from '../settings/preferences';
import { useOrderedPlaces } from './orderedPlaces';
import { PLACE_ICON } from './placeIcons';
import { useInventory } from './store';
import { countsByPlace } from './summary';

const TITLE_ID = 'where-sheet-title';

export function WhereSheet({ open, onPick, onClose, s }: { open: boolean; onPick: (placeId: string) => void; onClose: () => void; s: Strings }) {
  const places = useOrderedPlaces(s);
  const counts = countsByPlace(useInventory().items);
  const { lastPlaceId } = usePreferences();
  return (
    <Sheet open={open} onClose={onClose} labelledBy={TITLE_ID}>
      <SheetHeader id={TITLE_ID} title={s.where.title} closeLabel={s.close} onClose={onClose} autofocus />
      <div className="pt-2">
        <RowList>
          {places.map((place) => (
            <li key={place.id}>
              <ButtonRow
                dialog={false}
                onClick={() => onPick(place.id)}
                leading={<Bubble Icon={PLACE_ICON[place.kind]} tone={place.id === lastPlaceId ? 'lime' : 'soft'} />}
                title={labelOf(place, s)}
                subtitle={
                  <RowLine>
                    {s.placeKinds[place.kind]} · {s.itemCount(counts.get(place.id) ?? 0)}
                    {place.id === lastPlaceId ? ` · ${s.where.last}` : ''}
                  </RowLine>
                }
              />
            </li>
          ))}
        </RowList>
      </div>
    </Sheet>
  );
}
