// Every date and number the app shows, in the user's language, in one place. Pure, so the tests
// need no browser. (From stead's format.ts, trimmed to what Spisekammer uses.)

import type { Lang } from './strings';

export const localeOf = (lang: Lang) => (lang === 'da' ? 'da-DK' : 'en-GB');

const pad = (n: number) => String(n).padStart(2, '0');

// Today on the device, as yyyy-mm-dd (local time, not UTC).
export function today(now = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// "24. oktober 2026" / "24 October 2026".
export function formatDate(date: Date, lang: Lang): string {
  return date.toLocaleDateString(localeOf(lang), { day: 'numeric', month: 'long', year: 'numeric' });
}

// A day and a month without the year: "12. nov." / "12 Nov".
export function formatShortDate(date: Date, lang: Lang): string {
  return date.toLocaleDateString(localeOf(lang), { day: 'numeric', month: 'short' });
}

// A yyyy-mm-dd day as "12. nov.", with the year when it is not this year: "7. aug. 2027".
export function formatDay(day: string, lang: Lang, thisYear = today().slice(0, 4)): string {
  const [y = 1970, m = 1, d = 1] = day.split('-').map(Number);
  const options: Intl.DateTimeFormatOptions = String(y) === thisYear ? { day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(y, m - 1, d).toLocaleDateString(localeOf(lang), options);
}

// The name of a month, 0 = January.
export function monthName(index: number, lang: Lang): string {
  return new Intl.DateTimeFormat(localeOf(lang), { month: 'long' }).format(new Date(2000, index, 1));
}

// A number for a text field the user edits ("1,5" in Danish), and the number typed back.
export function decimalForInput(value: number, lang: Lang, digits = 1): string {
  const f = 10 ** digits;
  return String(Math.round(value * f) / f).replace('.', lang === 'da' ? ',' : '.');
}

export function parseDecimal(text: string): number | null {
  const value = Number(text.trim().replace(',', '.'));
  return text.trim() !== '' && Number.isFinite(value) ? value : null;
}

// A number typed into a counter (Stepper): a whole number, or with `decimal` a comma or point
// number, within min..max; null while it is not one yet (empty, "1,", too big).
export function parseCounter(text: string, min: number, max: number, decimal = false): number | null {
  const t = text.trim();
  if (!(decimal ? /^\d+([.,]\d*)?$/ : /^\d+$/).test(t)) return null;
  const value = decimal ? parseDecimal(t) : Number(t);
  return value !== null && value >= min && value <= max ? value : null;
}
