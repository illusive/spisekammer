// Every date and number the app shows, in the user's language, in one place. Pure, so the tests
// need no browser. (From stead's format.ts, trimmed to what Spisekammer uses.)

import type { Lang } from './strings';

export const localeOf = (lang: Lang) => (lang === 'da' ? 'da-DK' : 'en-GB');

const pad = (n: number) => String(n).padStart(2, '0');

// Today on the device, as yyyy-mm-dd (local time, not UTC).
export function today(now = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// A yyyy-mm-dd day as "12. nov.", with the year when it is not this year: "7. aug. 2027".
export function formatDay(day: string, lang: Lang, thisYear = today().slice(0, 4)): string {
  const [y = 1970, m = 1, d = 1] = day.split('-').map(Number);
  const options: Intl.DateTimeFormatOptions = String(y) === thisYear ? { day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(y, m - 1, d).toLocaleDateString(localeOf(lang), options);
}

// A month given as its last day (S-021), as "mar. 2027" / "Mar 2027".
export function formatMonth(day: string, lang: Lang): string {
  const [y = 1970, m = 1] = day.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(localeOf(lang), { month: 'short', year: 'numeric' });
}

// The name of a month, 0 = January.
export function monthName(index: number, lang: Lang): string {
  return new Intl.DateTimeFormat(localeOf(lang), { month: 'long' }).format(new Date(2000, index, 1));
}

// A number typed into a counter (Stepper): a whole number within min..max; null while it is not
// one yet (empty, too big).
export function parseCounter(text: string, min: number, max: number): number | null {
  const t = text.trim();
  if (!/^\d+$/.test(t)) return null;
  const value = Number(t);
  return value >= min && value <= max ? value : null;
}
