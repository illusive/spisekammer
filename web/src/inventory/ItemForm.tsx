// The fields for a new thing, shared by "Tilføj" and the scanner (S-006, S-010, S-015): a name (the
// food type and category are guessed from it until the user picks them), the count, an optional
// size and the date on the package. The place was chosen before (several things go to the same
// place). The type picker sits behind the guess: one tap to change it. Under the type, the date
// the app would give it in this place, so the guess can be checked.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, fieldClass, Stepper } from '../components/ui';
import { today } from '../i18n/format';
import type { Lang, Strings } from '../i18n/strings';
import { foodType, foodTypeName, matchFoodType } from '../keeping/foodTypes';
import { defaultPackageKind } from '../keeping/itemKeeping';
import { KeepDetails, PackageDateFields, readTypeValue, TypeSelect, typeValue } from '../keeping/KeepInfo';
import { keeping, urgency, type PackageKind } from '../keeping/rules';
import { placeName, placeOf } from '../places';
import { guessCategory, type Category } from './categories';
import { MAX_COUNT, type NewItem } from './model';
import { useInventory } from './store';
import { parseSize } from './size';

export interface FormStart {
  name?: string;
  brand?: string;
  category?: Category | null;
  placeId: string; // chosen before (S-015)
  size?: string;
  barcode?: string;
  count?: number;
}

export function ItemForm(props: { start: FormStart; idPrefix: string; lang: Lang; s: Strings; status?: ReactNode; autofocusName?: boolean; submitLabel: string; onSubmit: (item: NewItem) => void }) {
  const { start, idPrefix, lang, s, status, autofocusName, submitLabel, onSubmit } = props;
  const [name, setName] = useState(start.name ?? '');
  const [category, setCategory] = useState<Category | null>(start.category ?? null); // from a scan's lookup
  const [typeChoice, setTypeChoice] = useState<string | null>(null); // null: guessed from the name
  const [count, setCount] = useState(start.count ?? 1);
  const [size, setSize] = useState(start.size ?? '');
  const [packageDay, setPackageDay] = useState('');
  const [packageKind, setPackageKind] = useState<PackageKind | null>(null); // null: from the type
  const [showTypes, setShowTypes] = useState(false);
  const [missing, setMissing] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const allPlaces = useInventory().places;

  // A scan fills the form after it opened (the lookup is online): take what it found.
  useEffect(() => {
    if (start.name) setName(start.name);
    if (start.category) setCategory(start.category);
    if (start.size) setSize(start.size);
  }, [start.name, start.category, start.size]);

  // What it is: the user's choice, else the type found in the name, else only a category.
  const chosen = typeChoice ? readTypeValue(typeChoice) : null;
  const shownType = chosen ? foodType(chosen.typeId ?? undefined) : matchFoodType(name);
  const shownCategory: Category = chosen?.category ?? shownType?.category ?? category ?? guessCategory(name) ?? 'other';
  const shownPlace = start.placeId;
  const kind = packageKind ?? defaultPackageKind(shownType);

  const day = today();
  const placeKind = placeOf(allPlaces, shownPlace)?.kind ?? 'pantry';
  const preview = keeping({ type: shownType, place: placeKind, placedOn: day, ...(packageDay ? { packageDate: packageDay, packageKind: kind } : {}) });

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
      ...(shownType ? { typeId: shownType.id } : {}),
      placeId: shownPlace,
      count: read?.count ? count * read.count : count,
      ...(read ? { amount: read.amount, unit: read.unit } : size.trim() ? { sizeText: size.trim() } : {}),
      ...(start.barcode ? { barcode: start.barcode } : {}),
      ...(packageDay ? { packageDate: packageDay, packageKind: kind } : {}),
    });
    // Ready for the next one, in the same place.
    setName('');
    setCategory(null);
    setTypeChoice(null);
    setCount(1);
    setSize('');
    setPackageDay('');
    setPackageKind(null);
    setShowTypes(false);
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
          className={fieldClass}
        />
        {missing ? (
          <p id={`${idPrefix}-name-missing`} role="alert" className="text-sm font-bold text-danger">
            {s.nameMissing}
          </p>
        ) : null}
        {status ? <div className="text-sm text-muted">{status}</div> : null}
        <p className="flex flex-wrap items-center gap-x-[8px] text-sm text-muted">
          <span>
            {s.keep.whatIsIt}: <span className="font-bold text-text">{shownType ? foodTypeName(shownType, lang) : s.keep.noTypeOption(s.categories[shownCategory])}</span>
          </span>
          <button type="button" onClick={() => setShowTypes((v) => !v)} aria-expanded={showTypes} aria-controls={`${idPrefix}-type`} className="min-h-11 font-bold text-text underline underline-offset-4">
            {showTypes ? s.close : s.change}
          </button>
        </p>
        {showTypes ? (
          <TypeSelect
            id={`${idPrefix}-type`}
            value={typeValue(shownType?.id, shownCategory)}
            onChange={(v) => {
              setTypeChoice(v);
              setShowTypes(false);
            }}
            lang={lang}
            s={s}
          />
        ) : null}
      </div>
      {name.trim() ? (
        <div className="rounded-2xl bg-background px-[16px] py-3">
          <KeepDetails k={preview} urgency={urgency(preview, placeKind, day)} type={shownType} place={placeKind} placeLabel={placeName(allPlaces, shownPlace, s)} today={day} lang={lang} s={s} showLink={false} />
        </div>
      ) : null}
      <Stepper label={s.count} value={count} min={1} max={MAX_COUNT} onChange={setCount} />
      <label className="flex flex-col gap-1">
        <span className="font-bold">
          {s.size} <span className="font-normal text-muted">({s.optional})</span>
        </span>
        <input value={size} onChange={(e) => setSize(e.target.value)} placeholder={s.sizePlaceholder} autoComplete="off" className={fieldClass} />
      </label>
      <PackageDateFields idPrefix={idPrefix} day={packageDay} kind={kind} onDay={setPackageDay} onKind={setPackageKind} onClear={() => setPackageDay('')} s={s} />
      <Button type="submit" variant="primary">
        {submitLabel}
      </Button>
    </form>
  );
}
