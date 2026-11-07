// A thing's sheet (S-006, as stead's Forråd, D-049/D-054): the count saves at once; 0 means it is
// deleted when the sheet closes (until then + keeps it); "Flyt til" moves it; "Slet" asks first.

import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button, Choice, Sheet, SheetHeader, Stepper, useConfirm } from '../components/ui';
import type { Lang, Strings } from '../i18n/strings';
import { DEFAULT_PLACES, placeName } from '../places';
import { MAX_COUNT } from './model';
import { inventory, useInventory } from './store';
import { itemSummary } from './summary';

const TITLE_ID = 'item-sheet-title';

export function ItemSheet({ openId, onClose, onMessage, lang, s }: { openId: string | null; onClose: () => void; onMessage: (text: string) => void; lang: Lang; s: Strings }) {
  const item = useInventory().items.find((i) => i.id === openId);
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
            <div className="mt-4 flex flex-col gap-5 rounded-card bg-surface px-[20px] py-5">
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
              <Choice
                name="item-place"
                legend={s.moveTo}
                value={item.placeId}
                onChange={(placeId) => {
                  inventory.move(item.id, placeId);
                  onMessage(s.moved(item.name, placeName(placeId, s)));
                }}
                options={DEFAULT_PLACES.map((p) => ({ value: p.id, label: s.placeKinds[p.kind] }))}
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
