// The size as one field (S-022): a number with the unit in a dropdown at its end (stk., pk., ds.,
// g, kg, ml, cl, dl, l). A unit typed with the number ("500 g") moves to the dropdown.

import { useId, useState } from 'react';
import type { Strings } from '../i18n/strings';
import { SIZE_UNITS, sizeFromInput, splitUnit, type SizeUnit } from './size';

export function SizeField({ text, unit, onChange, s, idPrefix }: { text: string; unit: SizeUnit; onChange: (text: string, unit: SizeUnit) => void; s: Strings; idPrefix: string }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={`${idPrefix}-size`} className="mb-1 font-semibold">
        {s.size} <span className="font-normal text-muted">({s.optional})</span>
      </label>
      <div data-field="" className="flex h-12 w-full overflow-hidden rounded-field border border-border bg-surface focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
        <input
          id={`${idPrefix}-size`}
          value={text}
          onChange={(e) => {
            const split = splitUnit(e.target.value);
            if (split) onChange(split.amountText, split.unit);
            else onChange(e.target.value, unit);
          }}
          placeholder={s.sizePlaceholder}
          inputMode="decimal"
          autoComplete="off"
          enterKeyHint="done"
          className="min-w-0 flex-1 bg-transparent px-[12px] text-lg text-text placeholder:text-muted focus:outline-none"
        />
        <label htmlFor={id} className="sr-only">
          {s.unit}
        </label>
        <select id={id} value={unit} onChange={(e) => onChange(text, e.target.value as SizeUnit)} className="select-field h-full w-[5.5rem] shrink-0 appearance-none border-l border-border bg-surface-muted pr-[32px] pl-[12px] text-lg text-text focus:outline-none">
          {SIZE_UNITS.map((u) => (
            <option key={u} value={u}>
              {s.units[u]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// The field's text and unit for a thing's size, e.g. 400 g → "400" and g.
export function sizeStart(amount: number | undefined, unit: SizeUnit | undefined, sizeText: string | undefined, lang: 'da' | 'en'): { text: string; unit: SizeUnit } {
  if (amount && unit) return { text: String(amount).replace('.', lang === 'da' ? ',' : '.'), unit };
  if (sizeText) {
    const split = splitUnit(sizeText);
    return split ? { text: split.amountText, unit: split.unit } : { text: sizeText, unit: 'g' };
  }
  return { text: '', unit: 'g' };
}

// In a thing's sheet the size saves as it is typed (like the count): a valid size, or nothing when
// the field is emptied. The sheet's fields are remounted for each thing, so this starts afresh.
export function useLiveSize(start: { text: string; unit: SizeUnit }, save: (size: { amount: number; unit: SizeUnit } | null) => void) {
  const [text, setText] = useState(start.text);
  const [unit, setUnit] = useState<SizeUnit>(start.unit);
  const change = (t: string, u: SizeUnit) => {
    setText(t);
    setUnit(u);
    const read = sizeFromInput(t, u);
    if (read === null && t.trim() === '') save(null);
    else if (read && 'amount' in read && read.count === undefined) save({ amount: read.amount, unit: read.unit });
  };
  return { text, unit, change };
}
