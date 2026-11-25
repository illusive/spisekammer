// The fields for a new thing, shared by "Tilføj" and the scanner (S-006, S-021, S-022): where it
// goes (buttons, or a dropdown above three places), a name (its group, "Slags", is guessed from the
// name until the user picks one), the count, an optional size (a number with a unit dropdown) and
// an optional date: a day in the fridge, a month elsewhere. The place stays for the next thing.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, fieldClass, Stepper } from '../components/ui';
import type { Lang, Strings } from '../i18n/strings';
import { DateField } from '../keeping/DateInfo';
import { precisionFor, type DatePrecision } from '../keeping/rules';
import { tidyName } from '../lib/name';
import { placeOf } from '../places';
import { CategorySelect } from './CategorySelect';
import { guessCategory, type Category } from './categories';
import { MAX_COUNT, type NewItem } from './model';
import { useOrderedPlaces } from './orderedPlaces';
import { PlaceField } from './PlaceField';
import { SizeField, sizeStart } from './SizeField';
import { sizeFromInput, type SizeUnit } from './size';
import { useInventory } from './store';

export interface FormStart {
  name?: string;
  category?: Category | null;
  size?: string;
  barcode?: string;
  count?: number;
}

export function ItemForm(props: {
  start: FormStart;
  placeId: string;
  onPlace: (placeId: string) => void;
  idPrefix: string;
  lang: Lang;
  s: Strings;
  status?: ReactNode;
  autofocusName?: boolean;
  submitLabel: string;
  onSubmit: (item: NewItem) => void;
}) {
  const { start, placeId, onPlace, idPrefix, lang, s, status, autofocusName, submitLabel, onSubmit } = props;
  const [name, setName] = useState(start.name ?? '');
  const [found, setFound] = useState<Category | null>(start.category ?? null); // from a scan's lookup
  const [chosen, setChosen] = useState<Category | null>(null); // the user's pick, else guessed
  const [showGroups, setShowGroups] = useState(false);
  const [count, setCount] = useState(start.count ?? 1);
  const [size, setSize] = useState<{ text: string; unit: SizeUnit }>(() => sizeStart(undefined, undefined, start.size, lang));
  const [date, setDate] = useState<{ date: string; precision: DatePrecision } | null>(null);
  const [missing, setMissing] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const allPlaces = useInventory().places;
  const ordered = useOrderedPlaces(s);
  const precision = precisionFor(placeOf(allPlaces, placeId)?.kind ?? 'pantry');

  // A scan fills the form after it opened (the lookup is online): take what it found.
  useEffect(() => {
    if (start.name) setName(start.name);
    if (start.category) setFound(start.category);
    if (start.size) setSize(sizeStart(undefined, undefined, start.size, lang));
  }, [start.name, start.category, start.size, lang]);

  // A day given in the fridge does not fit the month field elsewhere, or the other way: start over.
  useEffect(() => {
    setDate((d) => (d && d.precision !== precision ? null : d));
  }, [precision]);

  const category: Category = chosen ?? found ?? guessCategory(name) ?? 'other';

  const submit = () => {
    const trimmed = tidyName(name);
    if (!trimmed) {
      setMissing(true);
      nameRef.current?.focus();
      return;
    }
    const read = sizeFromInput(size.text, size.unit);
    const multiplier = read && 'amount' in read && read.count ? read.count : 1;
    onSubmit({
      name: trimmed,
      category,
      placeId,
      count: Math.min(MAX_COUNT, count * multiplier),
      ...(read && 'amount' in read ? { amount: read.amount, unit: read.unit } : read ? { sizeText: read.sizeText } : {}),
      ...(start.barcode ? { barcode: start.barcode } : {}),
      ...(date ? { date: date.date, datePrecision: date.precision } : {}),
    });
    // Ready for the next one, in the same place and with the same unit.
    setName('');
    setFound(null);
    setChosen(null);
    setShowGroups(false);
    setCount(1);
    setSize((sz) => ({ text: '', unit: sz.unit }));
    setDate(null);
    setMissing(false);
    // Typing things in one after another: back to the name. After a scan the sheet closes, and
    // focusing a field in it would only flash the keyboard (S-016).
    if (autofocusName) nameRef.current?.focus();
  };

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <PlaceField
        name={`${idPrefix}-place`}
        legend={s.place}
        value={placeId}
        onChange={(id) => {
          onPlace(id);
          // Typing things in: after picking the place, straight on with the name. At once, so an
          // iPhone keeps the keyboard (focus only opens it within the tap), and once more after the
          // tap, as some browsers move focus to the tapped button afterwards.
          if (autofocusName) {
            nameRef.current?.focus({ preventScroll: true });
            window.setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 0);
          }
        }}
        places={ordered}
        s={s}
      />
      <div className="flex flex-col gap-1">
        <label htmlFor={`${idPrefix}-name`} className="mb-1 font-semibold">
          {s.name}
        </label>
        <input
          ref={nameRef}
          id={`${idPrefix}-name`}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setMissing(false);
          }}
          placeholder={s.namePlaceholder}
          data-autofocus={autofocusName ? '' : undefined}
          autoComplete="off"
          autoCapitalize="sentences"
          enterKeyHint="done"
          aria-invalid={missing || undefined}
          aria-describedby={missing ? `${idPrefix}-name-missing` : undefined}
          className={fieldClass}
        />
        {missing ? (
          <p id={`${idPrefix}-name-missing`} role="alert" className="text-sm font-semibold text-danger">
            {s.nameMissing}
          </p>
        ) : null}
        {status ? <div className="text-sm text-muted">{status}</div> : null}
        <p className="flex flex-wrap items-center gap-x-[8px] text-sm text-muted">
          <span>
            {s.keep.whatIsIt}: <span className="font-semibold text-text">{s.categories[category]}</span>
          </span>
          <button type="button" onClick={() => setShowGroups((v) => !v)} aria-expanded={showGroups} aria-controls={`${idPrefix}-group`} className="inline-flex min-h-11 min-w-11 items-center justify-center font-semibold text-text underline underline-offset-4">
            {showGroups ? s.close : s.change}
          </button>
        </p>
        {showGroups ? (
          <CategorySelect
            id={`${idPrefix}-group`}
            value={category}
            onChange={(c) => {
              setChosen(c);
              setShowGroups(false);
            }}
            s={s}
          />
        ) : null}
      </div>
      <Stepper label={s.count} value={count} min={1} max={MAX_COUNT} onChange={setCount} />
      <SizeField idPrefix={idPrefix} text={size.text} unit={size.unit} onChange={(text, unit) => setSize({ text, unit })} s={s} />
      <DateField idPrefix={idPrefix} precision={precision} date={date?.date} onChange={setDate} s={s} lang={lang} thisYear={new Date().getFullYear()} />
      <Button type="submit" variant="primary" arrow>
        {submitLabel}
      </Button>
    </form>
  );
}
