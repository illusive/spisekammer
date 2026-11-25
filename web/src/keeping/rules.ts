// A thing's date and how soon to use it (S-021). The app does not estimate: a thing has a date only
// when the user gives one. In the fridge it is a day; elsewhere a month, stored as the month's last
// day, so "Brug snart" and the overdue warning count the same way for both. Pure and tested.

import type { PlaceKind } from '../places';

export type DatePrecision = 'day' | 'month';

// --- Dates as yyyy-mm-dd, counted in UTC so time zones and summer time cannot shift a day.

const toDate = (day: string) => new Date(`${day}T00:00:00Z`);

export const daysBetween = (from: string, to: string) => Math.round((toDate(to).getTime() - toDate(from).getTime()) / 86_400_000);

// The last day of a month, as yyyy-mm-dd: monthEnd(2027, 2) is 2027-02-28 (month 1–12).
export function monthEnd(year: number, month: number): string {
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${year}-${String(month).padStart(2, '0')}-${String(last).padStart(2, '0')}`;
}

// How a place gives its dates: the fridge by the day, everywhere else by the month.
export const precisionFor = (place: PlaceKind): DatePrecision => (place === 'fridge' ? 'day' : 'month');

// How soon to use it, for "Brug snart" and the colour of the line. The window is longer where
// things keep longer: a few days in the fridge, two weeks in the pantry, a month in the freezer.
export type Urgency = 'past' | 'today' | 'soon' | 'later' | 'unknown';
export const SOON_DAYS: Record<PlaceKind, number> = { fridge: 3, pantry: 14, freezer: 30 };

export function urgency(date: string | undefined, place: PlaceKind, today: string): Urgency {
  if (!date) return 'unknown';
  const left = daysBetween(today, date);
  if (left < 0) return 'past';
  if (left === 0) return 'today';
  return left <= SOON_DAYS[place] ? 'soon' : 'later';
}
