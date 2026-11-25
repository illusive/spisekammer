// A thing's date (S-021): a short line in lists, one line on top of its sheet (and, once the date
// has passed, one warning), and the field to give it: a day in the fridge, a month and a year
// elsewhere. The app shows only the date the user gave; it never estimates one.

import { useEffect, useState } from 'react';
import { fieldClass, selectClass } from '../components/ui';
import { formatDay, formatMonth, monthName } from '../i18n/format';
import type { Lang, Strings } from '../i18n/strings';
import type { Item } from '../inventory/model';
import { daysBetween, monthEnd, type DatePrecision, type Urgency } from './rules';

const URGENT: Urgency[] = ['past', 'today', 'soon'];
export const urgentClass = (u: Urgency) => (u === 'past' ? 'font-semibold text-danger' : u === 'today' || u === 'soon' ? 'font-semibold text-warm' : 'text-muted');

export function formatItemDate(item: Pick<Item, 'date' | 'datePrecision'>, lang: Lang): string | null {
  if (!item.date) return null;
  return item.datePrecision === 'month' ? formatMonth(item.date, lang) : formatDay(item.date, lang);
}

// "i morgen", "om 3 dage": only for a day; a month's last day would read as a promise of the day.
function relative(item: Pick<Item, 'date' | 'datePrecision'>, today: string, s: Strings): string | null {
  if (!item.date || item.datePrecision === 'month') return null;
  const n = daysBetween(today, item.date);
  return n === 0 ? s.keep.today : n > 0 ? s.keep.inDays(n) : s.keep.daysAgo(-n);
}

// One line for lists: the date, and how soon when it is soon.
export function DateShort({ item, urgency, today, lang, s }: { item: Item; urgency: Urgency; today: string; lang: Lang; s: Strings }) {
  const date = formatItemDate(item, lang);
  if (!date) return null;
  const when = URGENT.includes(urgency) ? relative(item, today, s) : null;
  return <span className={`block text-sm ${urgentClass(urgency)}`}>{s.keep.date(when ? `${date} (${when})` : date)}</span>;
}

// On top of a thing's sheet: the date, and a warning once it has passed (S-021: nothing else).
export function DateLine({ item, urgency, today, lang, s }: { item: Item; urgency: Urgency; today: string; lang: Lang; s: Strings }) {
  const date = formatItemDate(item, lang);
  if (!date) return null;
  const when = URGENT.includes(urgency) ? relative(item, today, s) : null;
  return (
    <div className="flex flex-col gap-1">
      <p className={`text-lg ${urgency === 'later' ? 'font-semibold text-text' : urgentClass(urgency)}`}>
        {s.keep.date(date)}
        {when ? <span className="font-normal"> ({when})</span> : null}
      </p>
      {urgency === 'past' ? (
        <p role="note" className="rounded-[10px] bg-danger-bg px-[12px] py-2 text-sm font-semibold text-danger">
          {s.keep.past}
        </p>
      ) : null}
    </div>
  );
}

// Giving the date. `precision` comes from the place: a native day picker in the fridge, a month and
// a year elsewhere (two selects: the same in every browser). A month is stored as its last day.
export function DateField(props: { idPrefix: string; precision: DatePrecision; date: string | undefined; onChange: (date: { date: string; precision: DatePrecision } | null) => void; s: Strings; lang: Lang; thisYear: number }) {
  const { idPrefix, precision, date, onChange, s, lang, thisYear } = props;
  const [month, setMonth] = useState(date ? date.slice(5, 7) : '');
  const [year, setYear] = useState(date ? date.slice(0, 4) : '');
  useEffect(() => {
    setMonth(date ? date.slice(5, 7) : '');
    setYear(date ? date.slice(0, 4) : '');
  }, [date]);

  const pick = (m: string, y: string) => {
    setMonth(m);
    setYear(y);
    if (m && y) onChange({ date: monthEnd(Number(y), Number(m)), precision: 'month' });
    else if (!m && !y) onChange(null);
  };
  const years = Array.from({ length: 12 }, (_, i) => String(thisYear - 1 + i));
  if (year && !years.includes(year)) years.unshift(year);

  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="mb-1 font-semibold">
        {s.keep.dateLabel} <span className="font-normal text-muted">({s.optional})</span>
      </legend>
      <div className="flex gap-[8px]">
        {precision === 'day' ? (
          <input id={`${idPrefix}-date`} type="date" aria-label={s.keep.dateLabel} value={date ?? ''} onChange={(e) => onChange(e.target.value ? { date: e.target.value, precision: 'day' } : null)} className={`${fieldClass} flex-1`} />
        ) : (
          <>
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
          </>
        )}
      </div>
      {date || month || year ? (
        <button
          type="button"
          onClick={() => {
            setMonth('');
            setYear('');
            onChange(null);
          }}
          className="min-h-11 self-start text-sm font-semibold underline underline-offset-4"
        >
          {s.keep.removeDate}
        </button>
      ) : null}
    </fieldset>
  );
}
