// How a thing's keeping is shown (S-010): a short line in lists, the full story in its sheet and in
// the add form, the food-type picker and the package-date fields. Always "about" and "for guidance",
// never "safe" (AGENTS.md).

import { Info } from 'lucide-react';
import { Choice, fieldClass, selectClass } from '../components/ui';
import { formatDay } from '../i18n/format';
import type { Lang, Strings } from '../i18n/strings';
import { CATEGORIES, type Category } from '../inventory/categories';
import { hrefs } from '../router';
import { FOOD_TYPES } from './foodTypes';
import { daysBetween, inDoubtThrowOut, type Keeping, type PackageKind, type Urgency } from './rules';
import type { FoodType } from './types';
import type { PlaceKind } from '../places';

const URGENT: Urgency[] = ['past', 'today', 'soon'];
export const urgentClass = (u: Urgency) => (u === 'past' ? 'font-bold text-danger' : u === 'today' || u === 'soon' ? 'font-bold text-warm' : 'text-muted');

function dateLine(k: Keeping, lang: Lang, s: Strings): string | null {
  if (k.by === null) return null;
  const date = formatDay(k.by, lang);
  return k.source === 'useBy' ? s.keep.useBy(date) : k.source === 'bestBefore' ? s.keep.bestBefore(date) : s.keep.estimate(date);
}

function relative(k: Keeping, today: string, s: Strings): string | null {
  if (k.by === null) return null;
  const n = daysBetween(today, k.by);
  return n === 0 ? s.keep.today : n > 0 ? s.keep.inDays(n) : s.keep.daysAgo(-n);
}

// One line for lists: the date, and how soon when it is soon.
export function KeepShort({ k, urgency, today, lang, s }: { k: Keeping; urgency: Urgency; today: string; lang: Lang; s: Strings }) {
  const line = dateLine(k, lang, s);
  if (!line) return null;
  const when = URGENT.includes(urgency) ? relative(k, today, s) : null;
  return <span className={`block text-sm ${urgentClass(urgency)}`}>{when ? `${line} (${when})` : line}</span>;
}

function noteText(k: Keeping, placeName: string, s: Strings): string | null {
  switch (k.note) {
    case 'noType':
      return s.keep.noType;
    case 'noTime':
      return s.keep.noTime(placeName);
    case 'packageOnly':
      return s.keep.packageOnly;
    case 'notRecommended':
      return s.keep.notRecommended(placeName);
    case 'indefinitely':
      return s.keep.indefinitely;
    case 'whenRipe':
      return s.keep.whenRipe;
    case 'fridgeAfterOpening':
      return s.keep.fridgeAfterOpening;
    case 'roomHours':
      return s.keep.roomHours(k.hours ?? 2);
    default:
      return null;
  }
}

// The full story, for the sheet and the add form.
export function KeepDetails(props: { k: Keeping; urgency: Urgency; type: FoodType | undefined; place: PlaceKind; placeLabel: string; today: string; lang: Lang; s: Strings; showLink?: boolean }) {
  const { k, urgency, type, place, placeLabel, today, lang, s, showLink = true } = props;
  const line = dateLine(k, lang, s);
  const when = URGENT.includes(urgency) ? relative(k, today, s) : null; // "in 92 days" is noise
  const past = urgency === 'past' ? (k.source === 'useBy' ? s.keep.pastUseBy : k.source === 'bestBefore' ? s.keep.pastBestBefore : s.keep.pastEstimate) : null;
  const note = noteText(k, placeLabel, s);
  const range = k.source === 'estimate' && k.by && k.upTo ? s.keep.range(formatDay(k.by, lang), formatDay(k.upTo, lang)) : null;
  const doubt = k.by !== null && inDoubtThrowOut(k, type, place);
  return (
    <div className="flex flex-col gap-1" role="group" aria-label={s.keep.howWeCount}>
      {line ? (
        <p className={`text-lg ${urgentClass(urgency)} ${urgency === 'later' || urgency === 'unknown' ? 'text-text' : ''}`}>
          {line}
          {when ? <span className="font-normal"> ({when})</span> : null}
        </p>
      ) : null}
      {past ? <p className="font-bold text-danger">{past}</p> : null}
      {range ? <p className="text-sm text-muted">{range}</p> : null}
      {note ? <p className={line ? 'text-sm text-muted' : ''}>{note}</p> : null}
      {doubt && !past ? <p className="text-sm font-bold">{s.keep.inDoubt}</p> : null}
      {showLink ? (
        <a href={hrefs.rules} className="mt-1 inline-flex min-h-11 items-center gap-[6px] self-start text-sm font-bold underline underline-offset-4">
          <Info aria-hidden="true" className="size-4" />
          {s.keep.howWeCount}
        </a>
      ) : null}
    </div>
  );
}

// "Hvad er det?": the food types grouped by category, each category with "…, andet" (no type).
// Value: a type id (fk-43), or cat:<category> for a category without a type.
export function TypeSelect({ id, value, onChange, lang, s }: { id: string; value: string; onChange: (value: string) => void; lang: Lang; s: Strings }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
      {CATEGORIES.map((c) => (
        <optgroup key={c} label={s.categories[c]}>
          {FOOD_TYPES.filter((t) => t.category === c)
            .sort((a, b) => (lang === 'da' ? a.da : a.en).localeCompare(lang === 'da' ? b.da : b.en, lang))
            .map((t) => (
              <option key={t.id} value={t.id}>
                {lang === 'da' ? t.da : t.en}
              </option>
            ))}
          <option value={`cat:${c}`}>{s.keep.noTypeOption(s.categories[c])}</option>
        </optgroup>
      ))}
    </select>
  );
}

export const typeValue = (typeId: string | undefined, category: Category) => typeId ?? `cat:${category}`;
export function readTypeValue(value: string): { typeId: string | null; category: Category | null } {
  if (value.startsWith('cat:')) return { typeId: null, category: (CATEGORIES.find((c) => `cat:${c}` === value) ?? 'other') as Category };
  const type = FOOD_TYPES.find((t) => t.id === value);
  return type ? { typeId: type.id, category: type.category } : { typeId: null, category: null };
}

// The date on the package: a day, and which kind of date it is.
export function PackageDateFields(props: { idPrefix: string; day: string; kind: PackageKind; onDay: (day: string) => void; onKind: (kind: PackageKind) => void; onClear?: () => void; s: Strings }) {
  const { idPrefix, day, kind, onDay, onKind, onClear, s } = props;
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="font-bold">
          {s.keep.packageDate} <span className="font-normal text-muted">({s.optional})</span>
        </span>
        <span className="flex gap-[8px]">
          <input type="date" value={day} onChange={(e) => onDay(e.target.value)} className={`${fieldClass} flex-1`} />
          {day && onClear ? (
            <button type="button" onClick={onClear} className="min-h-11 px-[8px] text-sm font-bold underline underline-offset-4">
              {s.keep.removeDate}
            </button>
          ) : null}
        </span>
      </label>
      {day ? (
        <>
          <Choice<PackageKind> name={`${idPrefix}-package-kind`} legend={s.keep.packageKind} value={kind} onChange={onKind} options={(['useBy', 'bestBefore'] as const).map((v) => ({ value: v, label: s.keep.packageKinds[v] }))} />
          <p className="text-sm text-muted">{s.keep.packageHelp}</p>
        </>
      ) : null}
    </div>
  );
}
