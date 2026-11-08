// "Tilføj" (S-006): type one thing after another; each is added at once, a toast says where, and the
// form empties for the next (the place stays). The X closes it.

import { useState } from 'react';
import { Sheet, SheetHeader, Toast, type ToastMessage } from '../components/ui';
import type { Lang, Strings } from '../i18n/strings';
import { placeName } from '../places';
import { ItemForm } from './ItemForm';
import { inventory, useInventory } from './store';

const TITLE_ID = 'add-sheet-title';

// Adding to one place, chosen before (S-015): the sheet stays open for the next thing.
export function AddSheet({ open, placeId, onClose, lang, s }: { open: boolean; placeId: string; onClose: () => void; lang: Lang; s: Strings }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const { places } = useInventory();
  return (
    <Sheet open={open} onClose={onClose} labelledBy={TITLE_ID} dismissOnBackdrop={false}>
      <SheetHeader id={TITLE_ID} title={s.addHere(placeName(places, placeId, s))} closeLabel={s.close} onClose={onClose} />
      <div className="mt-4 rounded-card bg-surface px-[20px] py-5">
        <ItemForm
          start={{ placeId }}
          idPrefix="add"
          lang={lang}
          s={s}
          autofocusName
          submitLabel={s.add}
          onSubmit={(item) => {
            inventory.add(item);
            setToast({ id: Date.now(), text: s.added(item.name, placeName(places, item.placeId, s)) });
          }}
        />
      </div>
      {/* Inside the sheet, so it shows above the dimmed page (the sheet is in the top layer). */}
      <Toast message={toast} onHide={() => setToast(null)} />
    </Sheet>
  );
}
