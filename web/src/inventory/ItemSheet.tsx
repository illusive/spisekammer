// A thing's sheet (S-006, as stead's Forråd, D-049/D-054; S-021, S-022): on top, its date (and a
// warning once that has passed); the count saves at once (0 means it is deleted when the sheet
// closes, until then + keeps it); its size; "Flyt til" moves it; its group ("Slags") and its date;
// "Slet" asks first.

import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button, Sheet, SheetHeader, Stepper, useConfirm } from '../components/ui';
import { today } from '../i18n/format';
import type { Lang, Strings } from '../i18n/strings';
import { DateField, DateLine } from '../keeping/DateInfo';
import { itemKeeping } from '../keeping/itemKeeping';
import { precisionFor } from '../keeping/rules';
import { placeName } from '../places';
import { CategorySelect } from './CategorySelect';
import { MAX_COUNT, type Item } from './model';
import { useOrderedPlaces } from './orderedPlaces';
import { PlaceField } from './PlaceField';
import { SizeField, sizeStart, useLiveSize } from './SizeField';
import { inventory, useInventory } from './store';
import { itemSummary } from './summary';

const TITLE_ID = 'item-sheet-title';

export function ItemSheet({ openId, onClose, onMessage, lang, s }: { openId: string | null; onClose: () => void; onMessage: (text: string) => void; lang: Lang; s: Strings }) {
  const { items } = useInventory();
  const item = items.find((i) => i.id === openId);
  const [zero, setZero] = useState(false);
  const { confirm, sheet } = useConfirm();

  const close = () => {
    if (zero && item) {
      inventory.remove(item.id);
      onMessage(s.removed(item.name));
    }
    setZero(false);
    onClose();
  };

  const remove = async () => {
    if (!item) return;
    if (!(await confirm({ title: s.removeConfirm(item.name), body: s.cannotUndo, confirmLabel: s.remove, cancelLabel: s.cancel, danger: true }))) return;
    inventory.remove(item.id);
    onMessage(s.removed(item.name));
    setZero(false);
    onClose();
  };

  return (
    <>
      <Sheet open={item !== undefined} onClose={close} labelledBy={TITLE_ID}>
        {item ? (
          <>
            <SheetHeader id={TITLE_ID} title={item.name} closeLabel={s.close} onClose={close}>
              <p className="text-sm text-muted">{itemSummary({ ...item, count: zero ? 0 : item.count }, lang, s)}</p>
            </SheetHeader>
            <ItemFields key={item.id} item={item} zero={zero} setZero={setZero} onMessage={onMessage} onRemove={() => void remove()} lang={lang} s={s} />
          </>
        ) : null}
      </Sheet>
      {sheet}
    </>
  );
}

function ItemFields({ item, zero, setZero, onMessage, onRemove, lang, s }: { item: Item; zero: boolean; setZero: (zero: boolean) => void; onMessage: (text: string) => void; onRemove: () => void; lang: Lang; s: Strings }) {
  const { places } = useInventory();
  const ordered = useOrderedPlaces(s);
  const day = today();
  const info = itemKeeping(item, day, places);
  const size = useLiveSize(sizeStart(item.amount, item.unit, item.sizeText, lang), item.id, (next) => inventory.setSize(item.id, next));
  return (
    <div className="flex flex-col gap-5 pt-4">
      <DateLine item={item} urgency={info.urgency} today={day} lang={lang} s={s} />
      <Stepper
        label={s.count}
        value={zero ? 0 : item.count}
        min={0}
        max={MAX_COUNT}
        onChange={(n) => {
          if (n === 0) setZero(true);
          else {
            setZero(false);
            inventory.setCount(item.id, n);
          }
        }}
      />
      {zero ? (
        <p className="rounded-[10px] bg-warning-bg px-[16px] py-3 text-warning-text" role="status">
          {s.removeOnClose}
        </p>
      ) : null}
      <SizeField idPrefix="item" text={size.text} unit={size.unit} onChange={size.change} s={s} />
      <PlaceField
        name="item-place"
        legend={s.moveTo}
        value={item.placeId}
        onChange={(placeId) => {
          inventory.move(item.id, placeId);
          onMessage(s.moved(item.name, placeName(places, placeId, s)));
        }}
        places={ordered}
        s={s}
      />
      <label className="flex flex-col gap-1">
        <span className="mb-1 font-semibold">{s.keep.whatIsIt}</span>
        <CategorySelect id="item-group" value={item.category} onChange={(c) => inventory.setCategory(item.id, c)} s={s} />
      </label>
      <DateField
        idPrefix="item"
        precision={precisionFor(info.place)}
        date={item.date}
        onChange={(d) => inventory.setDate(item.id, d)}
        s={s}
        lang={lang}
        thisYear={new Date().getFullYear()}
      />
      <Button variant="danger" onClick={onRemove}>
        <Trash2 aria-hidden="true" className="size-5" />
        {s.remove}
      </Button>
    </div>
  );
}
