// Scanning, one thing after another (as stead's Forråd, D-053; S-006 here). The camera stays on until
// "Færdig". A barcode the household already has opens "Du har allerede …" with + / take one out, so
// scanning also answers "do I have this?". A new barcode is filled from this phone's memory or
// looked up on Open Food Facts (online only), then added with the usual fields.

import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Button, Sheet, SheetHeader, Stepper, Toast, type ToastMessage } from '../components/ui';
import type { Lang, Strings } from '../i18n/strings';
import { categoryFromTags, guessCategory } from '../inventory/categories';
import { ItemForm, type FormStart } from '../inventory/ItemForm';
import { MAX_COUNT, withBarcode, type Item } from '../inventory/model';
import { inventory, useInventory } from '../inventory/store';
import { usePageTitle } from '../lib/usePageTitle';
import { placeName } from '../places';
import { goBack, hrefs } from '../router';
import type { CameraState } from '../scan/BarcodeScanner';
import { lookUp, OFF_ATTRIBUTION } from '../scan/barcode';

const BarcodeScanner = lazy(() => import('../scan/BarcodeScanner'));
const TITLE_ID = 'scan-sheet-title';

type Entry = { key: number; code: string | null };

export function ScanScreen({ placeId, lang, s }: { placeId: string | null; lang: Lang; s: Strings }) {
  const [camera, setCamera] = useState<CameraState>('starting');
  const [entry, setEntry] = useState<Entry | null>(null);
  const [added, setAdded] = useState(0);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  usePageTitle(s.scan, s.appTitle);

  const onCode = useCallback((code: string) => setEntry({ key: Date.now(), code }), []);
  const done = (message: string, counted = true) => {
    setEntry(null);
    if (counted) setAdded((n) => n + 1);
    setToast({ id: Date.now(), text: message });
  };
  const blocked = camera === 'denied' || camera === 'unavailable';
  const back = placeId ? hrefs.place(placeId) : hrefs.home;

  return (
    <main className="fixed inset-0 z-30 flex flex-col bg-black text-white">
      <div className="flex items-center justify-between gap-[12px] px-[16px] pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <div>
          <h1 className="text-lg font-bold">{placeId ? `${s.scan} · ${placeName(placeId, s)}` : s.scan}</h1>
          <p className="text-sm text-white/70">{added > 0 ? s.addedCount(added) : ' '}</p>
        </div>
        <Button variant="primary" onClick={() => goBack(back)}>
          {s.done}
        </Button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <Suspense fallback={null}>
          <BarcodeScanner paused={entry !== null} onCode={onCode} onState={setCamera} />
        </Suspense>
      </div>
      <div className="flex flex-col items-center gap-2 px-[20px] pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center">
        <p role="status" className={camera === 'struggling' && entry === null ? 'font-bold text-amber-300' : ''}>
          {camera === 'denied' ? s.scanDenied : camera === 'unavailable' ? s.scanUnavailable : camera === 'starting' ? s.scanStarting : camera === 'struggling' ? s.scanSeenNotRead : s.scanHelp}
        </p>
        <button type="button" onClick={() => setEntry({ key: Date.now(), code: null })} className="min-h-11 px-[8px] font-bold underline underline-offset-4">
          {blocked ? s.typeInstead : s.noBarcode}
        </button>
        <p className="text-xs text-white/60">{s.scanPrivacy}</p>
      </div>
      <Sheet open={entry !== null} onClose={() => setEntry(null)} labelledBy={TITLE_ID} dismissOnBackdrop={false}>
        {entry ? <EntrySheet key={entry.key} code={entry.code} placeId={placeId} lang={lang} s={s} onDone={done} onCancel={() => setEntry(null)} /> : null}
      </Sheet>
      <Toast message={toast} onHide={() => setToast(null)} />
    </main>
  );
}

type SheetProps = { code: string | null; placeId: string | null; lang: Lang; s: Strings; onDone: (message: string, counted?: boolean) => void; onCancel: () => void };

function EntrySheet(props: SheetProps) {
  // Decided when the sheet opens: adding a new thing must not turn the sheet into "Du har allerede".
  const [existing] = useState(() => (props.code ? withBarcode(inventory.get(), props.code) : []));
  return existing.length > 0 ? <HaveItSheet items={existing} {...props} /> : <NewThingSheet {...props} />;
}

// A barcode the household has: where it is, and + / take one out (in this place if scanning there).
function HaveItSheet({ items, placeId, s, onDone, onCancel }: SheetProps & { items: Item[] }) {
  const live = useInventory().items;
  const current = items.map((i) => live.find((x) => x.id === i.id)).filter((i): i is Item => i !== undefined);
  const target = current.find((i) => i.placeId === placeId) ?? current[0];
  const [n, setN] = useState(1);
  if (!target) return null;
  const where = current.map((i) => s.inPlace(i.count, placeName(i.placeId, s))).join(', ');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        inventory.setCount(target.id, target.count + n);
        onDone(s.stocked(target.name, Math.min(MAX_COUNT, target.count + n)));
      }}
    >
      <SheetHeader id={TITLE_ID} title={target.name} closeLabel={s.close} onClose={onCancel} autofocus>
        <p className="mt-1">{s.alreadyHave(where)}</p>
      </SheetHeader>
      <div className="mt-4 flex flex-col gap-4 rounded-card bg-surface px-[20px] py-5">
        <Stepper label={s.count} value={n} min={1} max={MAX_COUNT} onChange={setN} />
        <Button type="submit" variant="primary">
          {s.addMore(n)}
        </Button>
        <Button
          variant="onPage"
          onClick={() => {
            inventory.setCount(target.id, target.count - 1);
            onDone(s.takenOut(target.name, target.count - 1), false);
          }}
        >
          {s.takeOne}
        </Button>
      </div>
    </form>
  );
}

// A new barcode (or none): filled from this phone's memory, else looked up online, else typed.
function NewThingSheet({ code, placeId, lang, s, onDone, onCancel }: SheetProps) {
  const [start, setStart] = useState<FormStart>(() => {
    const known = code ? inventory.get().products[code] : undefined;
    return { placeId, ...(code ? { barcode: code } : {}), ...(known ? { name: known.name, brand: known.brand, size: known.quantity, category: known.category ?? null } : {}) };
  });
  const [lookup, setLookup] = useState<'looking' | 'found' | 'notFound' | 'offline' | null>(null);

  useEffect(() => {
    if (!code || inventory.get().products[code]) return;
    let live = true;
    setLookup('looking');
    void lookUp(code).then((result) => {
      if (!live) return;
      if (result.kind !== 'found') {
        setLookup(result.kind);
        return;
      }
      const p = result.product;
      setStart((st) => ({ ...st, name: p.name, brand: p.brand, size: p.quantity, category: categoryFromTags(p.tags) ?? guessCategory(p.name) }));
      setLookup('found');
    });
    return () => {
      live = false;
    };
  }, [code]);

  const status = lookup === 'looking' ? s.lookingUp : lookup === 'found' ? s.productFrom(OFF_ATTRIBUTION) : lookup === 'notFound' ? s.lookupNotFound : lookup === 'offline' ? s.lookupOffline : null;

  return (
    <>
      <SheetHeader id={TITLE_ID} title={code ? s.addTitle : s.noBarcode} closeLabel={s.close} onClose={onCancel} autofocus={!!code} />
      <div className="mt-4 rounded-card bg-surface px-[20px] py-5">
        <ItemForm
          start={start}
          idPrefix="scan"
          lang={lang}
          s={s}
          status={status}
          autofocusName={!code}
          submitLabel={s.add}
          onSubmit={(item) => {
            inventory.add(item);
            // The barcode is remembered on this phone with what the user settled on (S-004).
            if (code) inventory.rememberProduct({ barcode: code, name: item.name, ...(item.brand ? { brand: item.brand } : {}), ...(start.size ? { quantity: start.size } : {}), category: item.category });
            onDone(s.added(item.name, placeName(item.placeId, s)));
          }}
        />
      </div>
    </>
  );
}
