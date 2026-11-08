// A thing's sheet (S-006, as stead's Forråd, D-049/D-054; S-010): on top, how long it keeps; the
// count saves at once (0 means it is deleted when the sheet closes, until then + keeps it);
// "Åbnet i dag"; "Flyt til" moves it (and starts the place's clock); what it is and the date on the
// package; "Slet" asks first.

import { PackageOpen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button, Choice, Sheet, SheetHeader, Stepper, useConfirm } from '../components/ui';
import { formatDay, today } from '../i18n/format';
import type { Lang, Strings } from '../i18n/strings';
import { defaultPackageKind, itemKeeping } from '../keeping/itemKeeping';
import { KeepDetails, PackageDateFields, readTypeValue, TypeSelect, typeValue } from '../keeping/KeepInfo';
import { placeName, sortPlaces } from '../places';
import { MAX_COUNT } from './model';
import { inventory, useInventory } from './store';
import { itemSummary } from './summary';

const TITLE_ID = 'item-sheet-title';

export function ItemSheet({ openId, onClose, onMessage, lang, s }: { openId: string | null; onClose: () => void; onMessage: (text: string) => void; lang: Lang; s: Strings }) {
  const { items, places } = useInventory();
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

  const day = today();
  const info = item ? itemKeeping(item, day, places) : null;

  return (
    <>
      <Sheet open={item !== undefined} onClose={close} labelledBy={TITLE_ID}>
        {item && info ? (
          <>
            <SheetHeader id={TITLE_ID} title={item.name} closeLabel={s.close} onClose={close}>
              <p className="text-sm text-muted">{itemSummary({ ...item, count: zero ? 0 : item.count }, lang, s)}</p>
            </SheetHeader>
            <div className="mt-4 flex flex-col gap-5 rounded-card bg-surface px-[20px] py-5">
              <KeepDetails k={info.keeping} urgency={info.urgency} type={info.type} place={info.place} placeLabel={placeName(places, item.placeId, s)} today={day} lang={lang} s={s} />
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
                <p className="rounded-2xl bg-note-bg px-[16px] py-3 text-note-text" role="status">
                  {s.removeOnClose}
                </p>
              ) : null}
              {info.place === 'freezer' ? null : item.openedOn ? (
                <p className="flex flex-wrap items-center gap-x-[12px]">
                  <span className="font-bold">{s.keep.openedOn(formatDay(item.openedOn, lang))}</span>
                  <button type="button" onClick={() => inventory.setOpened(item.id, false)} className="min-h-11 text-sm font-bold underline underline-offset-4">
                    {s.keep.notOpened}
                  </button>
                </p>
              ) : (
                <Button onClick={() => inventory.setOpened(item.id, true)}>
                  <PackageOpen aria-hidden="true" className="size-5" />
                  {s.keep.openedToday}
                </Button>
              )}
              <Choice
                name="item-place"
                legend={s.moveTo}
                value={item.placeId}
                onChange={(placeId) => {
                  inventory.move(item.id, placeId);
                  onMessage(s.moved(item.name, placeName(places, placeId, s)));
                }}
                options={sortPlaces(places).map((p) => ({ value: p.id, label: placeName(places, p.id, s) }))}
              />
              <label className="flex flex-col gap-1">
                <span className="font-bold">{s.keep.whatIsIt}</span>
                <TypeSelect
                  id="item-type"
                  value={typeValue(item.typeId, item.category)}
                  onChange={(v) => {
                    const { typeId, category } = readTypeValue(v);
                    if (category) inventory.setType(item.id, typeId, category);
                  }}
                  lang={lang}
                  s={s}
                />
              </label>
              <PackageDateFields
                idPrefix="item"
                day={item.packageDate ?? ''}
                kind={item.packageKind ?? defaultPackageKind(info.type)}
                onDay={(d) => inventory.setPackageDate(item.id, d ? { day: d, kind: item.packageKind ?? defaultPackageKind(info.type) } : null)}
                onKind={(k) => item.packageDate && inventory.setPackageDate(item.id, { day: item.packageDate, kind: k })}
                onClear={() => inventory.setPackageDate(item.id, null)}
                s={s}
              />
              <Button variant="danger" onClick={() => void remove()}>
                <Trash2 aria-hidden="true" className="size-5" />
                {s.remove}
              </Button>
            </div>
          </>
        ) : null}
      </Sheet>
      {sheet}
    </>
  );
}
