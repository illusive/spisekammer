// A thing's date (S-021): a short line in lists, one line on top of its sheet (and, once the date
// has passed, one warning), and the field to give it: a day in the fridge, a month and a year
// elsewhere. The app shows only the date the user gave; it never estimates one.

import { useState } from 'react';
import { Button, FieldLabel, Notice, fieldClass, selectClass } from '../components/ui';
import { formatDay, formatMonth, monthName } from '../i18n/format';
import type { Lang, Strings } from '../i18n/strings';
import type { Item } from '../inventory/model';
import { daysBetween, isUrgent, monthEnd, type DatePrecision, type Urgency } from './rules';

export const urgentClass = (u: Urgency) => (u === 'past' ? 'font-semibold text-danger' : u === 'today' || u === 'soon' ? 'font-semibold text-warm' : 'text-muted');

export function formatItemDate(item: Pick<Item, 'date' | 'datePrecision'>, lang: Lang): string | null {
  if (!item.date) return null;
  return item.datePrecision === 'month' ? formatMonth(item.date, lang) : formatDay(item.date, lang);
}

// The date, and how soon when it is soon: "12. nov. (om 2 dage)". "i morgen", "om 3 dage" only for a
// day; a month's last day would read as a promise of the day.
function dateWithWhen(item: Pick<Item, 'date' | 'datePrecision'>, urgency: Urgency, today: string, lang: Lang, s: Strings): { date: string; when: string | null } | null {
  const date = formatItemDate(item, lang);
  if (!date || !item.date) return null;
  if (!isUrgent(urgency) || item.datePrecision === 'month') return { date, when: null };
  const n = daysBetween(today, item.date);
  return { date, when: n === 0 ? s.keep.today : n > 0 ? s.keep.inDays(n) : s.keep.daysAgo(-n) };
}

// One line for lists.
export function DateShort({ item, urgency, today, lang, s }: { item: Item; urgency: Urgency; today: string; lang: Lang; s: Strings }) {
  const shown = dateWithWhen(item, urgency, today, lang, s);
  if (!shown) return null;
  return <span className={`block text-sm ${urgentClass(urgency)}`}>{s.keep.date(shown.when ? `${shown.date} (${shown.when})` : shown.date)}</span>;
}

// On top of a thing's sheet: the date, and a warning once it has passed (S-021: nothing else).
export function DateLine({ item, urgency, today, lang, s }: { item: Item; urgency: Urgency; today: string; lang: Lang; s: Strings }) {
  const shown = dateWithWhen(item, urgency, today, lang, s);
  if (!shown) return null;
  return (
    <div className="flex flex-col gap-1">
      <p className={`text-lg ${urgency === 'later' ? 'font-semibold text-text' : urgentClass(urgency)}`}>
        {s.keep.date(shown.date)}
        {shown.when ? <span className="font-normal"> ({shown.when})</span> : null}
      </p>
      {urgency === 'past' ? <Notice tone="danger">{s.keep.past}</Notice> : null}
    </div>
  );
}

// Whether this browser has a native month field: the iPhone's month-and-year wheel (S-024), and
// Android's month picker. Elsewhere the month and the year are two dropdowns.
const NATIVE_MONTH = (() => {
  if (typeof document === 'undefined') return false;
  const input = document.createElement('input');
  input.setAttribute('type', 'month');
  return input.type === 'month';
})();

type DateValue = { date: string; precision: DatePrecision } | null;

// Giving the date. `precision` comes from the place: a native day picker in the fridge, a month
// and a year elsewhere. A month is stored as its last day.
export function DateField({ idPrefix, precision, date, onChange, s, lang, thisYear }: { idPrefix: string; precision: DatePrecision; date: string | undefined; onChange: (date: DateValue) => void; s: Strings; lang: Lang; thisYear: number }) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="contents">
        <FieldLabel optional={s.optional}>{s.keep.dateLabel}</FieldLabel>
      </legend>
      {precision === 'day' ? (
        <input id={`${idPrefix}-date`} type="date" aria-label={s.keep.dateLabel} value={date ?? ''} onChange={(e) => onChange(e.target.value ? { date: e.target.value, precision: 'day' } : null)} className={fieldClass} />
      ) : NATIVE_MONTH ? (
        <input
          id={`${idPrefix}-month`}
          type="month"
          aria-label={s.keep.dateLabel}
          value={date ? date.slice(0, 7) : ''}
          onChange={(e) => {
            const [y, m] = e.target.value.split('-').map(Number);
            onChange(y && m ? { date: monthEnd(y, m), precision: 'month' } : null);
          }}
          className={fieldClass}
        />
      ) : (
        <MonthSelects idPrefix={idPrefix} date={date} onChange={onChange} s={s} lang={lang} thisYear={thisYear} />
      )}
      {date ? (
        <Button variant="link" onClick={() => onChange(null)} className="self-start">
          {s.keep.removeDate}
        </Button>
      ) : null}
    </fieldset>
  );
}

// Without a native month field: a month and a year, each a dropdown (the same in every browser).
// Only a half-picked month (a month without a year, or the other way) is kept here; a whole one is
// the date itself.
function MonthSelects({ idPrefix, date, onChange, s, lang, thisYear }: { idPrefix: string; date: string | undefined; onChange: (date: DateValue) => void; s: Strings; lang: Lang; thisYear: number }) {
  const [partial, setPartial] = useState<{ month: string; year: string } | null>(null);
  const month = partial?.month ?? (date ? date.slice(5, 7) : '');
  const year = partial?.year ?? (date ? date.slice(0, 4) : '');
  const pick = (m: string, y: string) => {
    if (m && y) {
      setPartial(null);
      onChange({ date: monthEnd(Number(y), Number(m)), precision: 'month' });
    } else if (!m && !y) {
      setPartial(null);
      onChange(null);
    } else setPartial({ month: m, year: y });
  };
  const years = Array.from({ length: 12 }, (_, i) => String(thisYear - 1 + i));
  if (year && !years.includes(year)) years.unshift(year);
  return (
    <div className="flex gap-[8px]">
      <select id={`${idPrefix}-month`} aria-label={s.keep.month} value={month} onChange={(e) => pick(e.target.value, year)} className={`${selectClass} flex-[3]`}>
        <option value="">{s.keep.month}</option>
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i} value={String(i + 1).padStart(2, '0')}>
            {monthName(i, lang)}
          </option>
        ))}
      </select>
      <select id={`${idPrefix}-year`} aria-label={s.keep.year} value={year} onChange={(e) => pick(month, e.target.value)} className={`${selectClass} flex-[2]`}>
        <option value="">{s.keep.year}</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
