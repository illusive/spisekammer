// The fields for a new thing, shared by "Tilføj" and the scanner (S-006): a name (the category and
// place are guessed from it until the user picks them), the place, the count and an optional size.
// The category picker sits behind the guess: one tap to change it.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, Choice, inputClass, Stepper } from '../components/ui';
import type { Lang, Strings } from '../i18n/strings';
import { placeIdOf, useShownPlaces } from '../places';
import { usePreferences } from '../settings/preferences';
import { CATEGORIES, defaultPlaceKind, guessCategory, soundsFrozen, type Category } from './categories';
import { MAX_COUNT, type NewItem } from './model';
import { parseSize } from './size';

export interface FormStart {
  name?: string;
  brand?: string;
  category?: Category | null;
  placeId?: string | null; // fixed by where the user came from (a place's page)
  size?: string;
  barcode?: string;
  count?: number;
}

export function ItemForm(props: { start: FormStart; idPrefix: string; lang: Lang; s: Strings; status?: ReactNode; autofocusName?: boolean; submitLabel: string; onSubmit: (item: NewItem) => void }) {
  const { start, idPrefix, s, status, autofocusName, submitLabel, onSubmit } = props;
  const [name, setName] = useState(start.name ?? '');
  const [category, setCategory] = useState<Category | null>(start.category ?? null); // null: guessed from the name
  const [placeId, setPlaceId] = useState<string | null>(start.placeId ?? null); // null: from the category
  const [count, setCount] = useState(start.count ?? 1);
  const [size, setSize] = useState(start.size ?? '');
  const [showCategories, setShowCategories] = useState(false);
  const [missing, setMissing] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // A scan fills the form after it opened (the lookup is online): take what it found.
  useEffect(() => {
    if (start.name) setName(start.name);
    if (start.category) setCategory(start.category);
    if (start.size) setSize(start.size);
  }, [start.name, start.category, start.size]);

  const shownCategory: Category = category ?? guessCategory(name) ?? 'other';
  const { fridge } = usePreferences();
  const shownPlace = placeId ?? placeIdOf(soundsFrozen(name) ? 'freezer' : defaultPlaceKind(shownCategory, fridge));
  const places = useShownPlaces(shownPlace);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setMissing(true);
      nameRef.current?.focus();
      return;
    }
    const read = size.trim() ? parseSize(size) : null;
    onSubmit({
      name: trimmed,
      ...(start.brand ? { brand: start.brand } : {}),
      category: shownCategory,
      placeId: shownPlace,
      count: read?.count ? count * read.count : count,
      ...(read ? { amount: read.amount, unit: read.unit } : size.trim() ? { sizeText: size.trim() } : {}),
      ...(start.barcode ? { barcode: start.barcode } : {}),
    });
    // Ready for the next one; the place stays (things bought together usually go together).
    setName('');
    setCategory(null);
    setCount(1);
    setSize('');
    setShowCategories(false);
    setMissing(false);
    nameRef.current?.focus();
  };

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="flex flex-col gap-1">
        <label htmlFor={`${idPrefix}-name`} className="font-bold">
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
          enterKeyHint="done"
          aria-invalid={missing || undefined}
          aria-describedby={missing ? `${idPrefix}-name-missing` : undefined}
          className={`${inputClass} min-h-12 text-lg`}
        />
        {missing ? (
          <p id={`${idPrefix}-name-missing`} role="alert" className="text-sm font-bold text-danger">
            {s.nameMissing}
          </p>
        ) : null}
        {status ? <div className="text-sm text-muted">{status}</div> : null}
        <p className="flex flex-wrap items-center gap-x-[8px] text-sm text-muted">
          <span>
            {s.category}: {s.categories[shownCategory]}
          </span>
          <button type="button" onClick={() => setShowCategories((v) => !v)} aria-expanded={showCategories} className="min-h-11 font-bold text-text underline underline-offset-4">
            {showCategories ? s.close : s.change}
          </button>
        </p>
        {showCategories ? (
          <select
            aria-label={s.category}
            value={shownCategory}
            onChange={(e) => {
              setCategory(e.target.value as Category);
              setShowCategories(false);
            }}
            className={`${inputClass} min-h-12 text-lg`}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {s.categories[c]}
              </option>
            ))}
          </select>
        ) : null}
      </div>
      <Choice name={`${idPrefix}-place`} legend={s.place} value={shownPlace} onChange={setPlaceId} options={places.map((p) => ({ value: p.id, label: s.placeKinds[p.kind] }))} />
      <Stepper label={s.count} value={count} min={1} max={MAX_COUNT} onChange={setCount} />
      <label className="flex flex-col gap-1">
        <span className="font-bold">
          {s.size} <span className="font-normal text-muted">({s.optional})</span>
        </span>
        <input value={size} onChange={(e) => setSize(e.target.value)} placeholder={s.sizePlaceholder} autoComplete="off" className={`${inputClass} min-h-12 text-lg`} />
      </label>
      <Button type="submit" variant="primary">
        {submitLabel}
      </Button>
    </form>
  );
}
