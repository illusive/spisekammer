// "Tilføj" (S-006, S-022): type one thing after another; each is added at once, a toast says where,
// and the form empties for the next. The place is a field at the top of the form, starting on the
// place you are on, else the last one used. The X closes it.

import { useState } from 'react';
import { Sheet, SheetHeader, Toast, type ToastMessage } from '../components/ui';
import type { Lang, Strings } from '../i18n/strings';
import { placeName } from '../places';
import { ItemForm } from './ItemForm';
import { rememberPlace, useStartPlace } from './orderedPlaces';
import { inventory } from './store';

const TITLE_ID = 'add-sheet-title';

export function AddSheet({ open, placeId: given, onClose, lang, s }: { open: boolean; placeId: string | null; onClose: () => void; lang: Lang; s: Strings }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [placeId, setPlaceId] = useStartPlace(s, given);
  return (
    <Sheet open={open} onClose={onClose} labelledBy={TITLE_ID} dismissOnBackdrop={false}>
      <SheetHeader id={TITLE_ID} title={s.addTitle} closeLabel={s.close} onClose={onClose} />
      <div className="pt-4">
        <ItemForm
          start={{}}
          placeId={placeId}
          onPlace={setPlaceId}
          idPrefix="add"
          lang={lang}
          s={s}
          autofocusName
          submitLabel={s.add}
          onSubmit={(item) => {
            const result = inventory.add(item);
            rememberPlace(item.placeId);
            const where = placeName(inventory.get().places, item.placeId, s);
            setToast({ id: Date.now(), text: result.merged ? s.stocked(item.name, result.count) : s.added(item.name, where) });
          }}
        />
      </div>
      {/* Inside the sheet, so it shows above the dimmed page (the sheet is in the top layer). */}
      <Toast message={toast} onHide={() => setToast(null)} />
    </Sheet>
  );
}
