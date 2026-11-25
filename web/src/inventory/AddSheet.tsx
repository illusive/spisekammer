// "Tilføj" (S-006, S-022, S-024): type one thing after another; each is added at once, a message says
// where, and the form empties for the next. The place is a field at the top of the form, preset to
// the place chosen in "Hvor lægger du ting?" or the page's own. The X closes it.

import { Sheet, SheetHeader } from '../components/sheet';
import { useToast } from '../components/toast';
import type { Lang, Strings } from '../i18n/strings';
import { addThing } from './addThing';
import { ItemForm } from './ItemForm';
import { useStartPlace } from './orderedPlaces';

const TITLE_ID = 'add-sheet-title';

// Give it a new `key` for each opening, so it starts on the place it was given; it stays mounted
// while closed, so it slides down like the other sheets.
export function AddSheet({ open, placeId: given, onClose, lang, s }: { open: boolean; placeId: string | null; onClose: () => void; lang: Lang; s: Strings }) {
  const { show, toast } = useToast();
  const [placeId, setPlaceId] = useStartPlace(s, given);
  return (
    <Sheet open={open} onClose={onClose} labelledBy={TITLE_ID} dismissOnBackdrop={false}>
      <SheetHeader id={TITLE_ID} title={s.addTitle} closeLabel={s.close} onClose={onClose} />
      <div className="pt-4">
        <ItemForm start={{}} placeId={placeId} onPlace={setPlaceId} idPrefix="add" lang={lang} s={s} autofocusName submitLabel={s.add} onSubmit={(item) => show(addThing(item, s))} />
      </div>
      {/* Inside the sheet, so it shows above the dimmed page (the sheet is in the top layer). */}
      {toast}
    </Sheet>
  );
}
