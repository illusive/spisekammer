// "Tilføj" (S-006): type one thing after another; each is added at once, a toast says where, and the
// form empties for the next (the place stays). The X closes it.

import { useState } from 'react';
import { Sheet, SheetHeader, Toast, type ToastMessage } from '../components/ui';
import type { Lang, Strings } from '../i18n/strings';
import { placeName } from '../places';
import { ItemForm } from './ItemForm';
import { inventory } from './store';

const TITLE_ID = 'add-sheet-title';

export function AddSheet({ open, placeId, onClose, lang, s }: { open: boolean; placeId: string | null; onClose: () => void; lang: Lang; s: Strings }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  return (
    <Sheet open={open} onClose={onClose} labelledBy={TITLE_ID} dismissOnBackdrop={false}>
      <SheetHeader id={TITLE_ID} title={placeId ? s.addHere(placeName(placeId, s)) : s.addTitle} closeLabel={s.close} onClose={onClose} />
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
            setToast({ id: Date.now(), text: s.added(item.name, placeName(item.placeId, s)) });
          }}
        />
      </div>
      {/* Inside the sheet, so it shows above the dimmed page (the sheet is in the top layer). */}
      <Toast message={toast} onHide={() => setToast(null)} />
    </Sheet>
  );
}
