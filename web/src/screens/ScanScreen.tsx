// Scanning, one thing after another (as stead's Forråd, D-053; S-006 here). The camera stays on until
// "Færdig". A barcode the household already has opens "Du har allerede …", so scanning also answers
// "do I have this?". A new barcode is filled from this phone's memory (what the user settled on last
// time, S-024) or looked up on Open Food Facts (online only), then added with the usual fields. The
// place starts on the one chosen before scanning (S-024) and can be changed in the form.

import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Sheet, SheetHeader } from '../components/sheet';
import { Stepper } from '../components/Stepper';
import { useToast } from '../components/toast';
import { Button } from '../components/ui';
import type { Lang, Strings } from '../i18n/strings';
import { addThing } from '../inventory/addThing';
import { categoryFromTags, guessCategory } from '../inventory/categories';
import { ItemForm, type FormStart } from '../inventory/ItemForm';
import { MAX_COUNT, withBarcode, type Item, type Product } from '../inventory/model';
import { useStartPlace } from '../inventory/orderedPlaces';
import { sizeText } from '../inventory/size';
import { inventory, useInventory } from '../inventory/store';
import { usePageTitle } from '../lib/usePageTitle';
import { placeName } from '../places';
import { goBack, hrefs } from '../router';
import type { CameraState } from '../scan/BarcodeScanner';
import { lookUp, OFF_ATTRIBUTION } from '../scan/barcode';

const BarcodeScanner = lazy(() => import('../scan/BarcodeScanner'));
const TITLE_ID = 'scan-sheet-title';

type Entry = { key: number; code: string | null };

export function ScanScreen({ placeId: from, lang, s }: { placeId: string | null; lang: Lang; s: Strings }) {
  const [camera, setCamera] = useState<CameraState>('starting');
  const [entry, setEntry] = useState<Entry | null>(null);
  const [added, setAdded] = useState(0);
  const { show, toast } = useToast();
  const [placeId, setPlaceId] = useStartPlace(s, from);
  usePageTitle(s.scan, s.appTitle);

  const onCode = useCallback((code: string) => setEntry({ key: Date.now(), code }), []);
  const done = (message: string, counted = true) => {
    setEntry(null);
    if (counted) setAdded((n) => n + 1);
    show(message);
  };
  const blocked = camera === 'denied' || camera === 'unavailable';
  const back = from ? hrefs.place(from) : hrefs.home;
  const cameraText: Record<CameraState, string> = { denied: s.scanDenied, unavailable: s.scanUnavailable, starting: s.scanStarting, struggling: s.scanSeenNotRead, scanning: s.scanHelp };

  return (
    <main className="fixed inset-0 z-30 flex flex-col bg-primary-deep text-white">
      <div className="flex items-center justify-between gap-[12px] px-[18px] pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <div>
          <h1 className="text-lg font-semibold">{s.scan}</h1>
          <p className="text-sm text-white/70">{added > 0 ? s.addedCount(added) : ' '}</p>
        </div>
        <Button variant="accent" onClick={() => goBack(back)} className="w-auto">
          {s.done}
        </Button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <Suspense fallback={null}>
          <BarcodeScanner paused={entry !== null} onCode={onCode} onState={setCamera} />
        </Suspense>
      </div>
      <div className="flex flex-col items-center gap-2 px-[20px] pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center">
        <p role="status" className={camera === 'struggling' && entry === null ? 'font-semibold text-accent' : ''}>
          {cameraText[camera]}
        </p>
        <Button variant="link" onClick={() => setEntry({ key: Date.now(), code: null })} className="text-base">
          {blocked ? s.typeInstead : s.noBarcode}
        </Button>
        <p className="text-xs text-white/60">{s.scanPrivacy}</p>
      </div>
      <Sheet open={entry !== null} onClose={() => setEntry(null)} labelledBy={TITLE_ID} dismissOnBackdrop={false}>
        {entry ? <EntrySheet key={entry.key} code={entry.code} placeId={placeId} onPlace={setPlaceId} lang={lang} s={s} onDone={done} onCancel={() => setEntry(null)} /> : null}
      </Sheet>
      {toast}
    </main>
  );
}

type SheetProps = { code: string | null; placeId: string; onPlace: (placeId: string) => void; lang: Lang; s: Strings; onDone: (message: string, counted?: boolean) => void; onCancel: () => void };

function EntrySheet(props: SheetProps) {
  // Decided when the sheet opens: adding a new thing must not turn the sheet into "Du har allerede".
  const [existing] = useState(() => (props.code ? withBarcode(inventory.get(), props.code) : []));
  return existing.length > 0 ? <HaveItSheet items={existing} {...props} /> : <NewThingSheet {...props} />;
}

// A barcode the household has: where it is, and what to do. In the chosen place: + there, or take
// one out. Only elsewhere (S-024): put it in the chosen place (a line of its own), or add to or take
// out of where it is, said by name, so nothing happens silently in another place.
function HaveItSheet({ items, placeId, s, onDone, onCancel }: SheetProps & { items: Item[] }) {
  const { items: live, places } = useInventory();
  const current = items.map((i) => live.find((x) => x.id === i.id)).filter((i): i is Item => i !== undefined);
  const here = current.find((i) => i.placeId === placeId);
  const target = here ?? current[0];
  const [n, setN] = useState(1);
  if (!target) return null;
  const where = current.map((i) => s.inPlace(i.count, placeName(places, i.placeId, s))).join(', ');
  const chosen = placeName(places, placeId, s);
  const there = placeName(places, target.placeId, s);
  const addThere = () => {
    inventory.setCount(target.id, target.count + n);
    onDone(s.stocked(target.name, Math.min(MAX_COUNT, target.count + n)));
  };
  const putHere = () => {
    const { id: _id, addedOn: _a, placedOn: _p, updatedAt: _u, date: _d, datePrecision: _dp, ...thing } = target;
    onDone(addThing({ ...thing, placeId, count: n }, s));
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (here) addThere();
        else putHere();
      }}
    >
      <SheetHeader id={TITLE_ID} title={target.name} closeLabel={s.close} onClose={onCancel} autofocus>
        <p className="mt-1">{s.alreadyHave(where)}</p>
      </SheetHeader>
      <div className="flex flex-col gap-4 pt-4">
        <Stepper label={s.count} value={n} min={1} max={MAX_COUNT} onChange={setN} />
        <Button type="submit" variant="primary">
          {here ? s.addMore(n) : s.addInto(n, chosen)}
        </Button>
        {here ? null : <Button onClick={addThere}>{s.addMoreIn(n, there)}</Button>}
        <Button
          onClick={() => {
            inventory.setCount(target.id, target.count - 1);
            onDone(s.takenOut(target.name, target.count - 1), false);
          }}
        >
          {here ? s.takeOne : s.takeOneFrom(there)}
        </Button>
      </div>
    </form>
  );
}

// A remembered barcode as the form's start: the name, group and size the user settled on.
const startFrom = (p: Product): FormStart => ({ name: p.name, category: p.category ?? null, size: p.amount && p.unit ? sizeText({ amount: p.amount, unit: p.unit }) : p.sizeText });

// A new barcode (or none): filled from this phone's memory, else looked up online, else typed.
function NewThingSheet({ code, placeId, onPlace, lang, s, onDone, onCancel }: SheetProps) {
  const [known] = useState(() => (code ? inventory.get().products[code] : undefined));
  const [found, setFound] = useState<FormStart | null>(null);
  const [lookup, setLookup] = useState<'looking' | 'found' | 'notFound' | 'offline' | null>(null);

  useEffect(() => {
    if (!code || known) return;
    let live = true;
    setLookup('looking');
    void lookUp(code).then((result) => {
      if (!live) return;
      if (result.kind !== 'found') {
        setLookup(result.kind);
        return;
      }
      const p = result.product;
      setFound({ name: p.name, size: p.quantity, category: categoryFromTags(p.tags) ?? guessCategory(p.name) });
      setLookup('found');
    });
    return () => {
      live = false;
    };
  }, [code, known]);

  const start: FormStart = { ...(code ? { barcode: code } : {}), ...(known ? startFrom(known) : found ?? {}) };
  const status = known ? s.knownBarcode : lookup === 'looking' ? s.lookingUp : lookup === 'found' ? s.productFrom(OFF_ATTRIBUTION) : lookup === 'notFound' ? s.lookupNotFound : lookup === 'offline' ? s.lookupOffline : null;

  return (
    <>
      <SheetHeader id={TITLE_ID} title={code ? s.addTitle : s.noBarcode} closeLabel={s.close} onClose={onCancel} autofocus={!!code} />
      <div className="pt-4">
        {/* The lookup answers after the form has opened: a fresh form with what it found. */}
        <ItemForm key={found ? 'found' : 'start'} start={start} placeId={placeId} onPlace={onPlace} idPrefix="scan" lang={lang} s={s} status={status} autofocusName={!code} submitLabel={s.add} onSubmit={(item) => onDone(addThing(item, s))} />
      </div>
    </>
  );
}
