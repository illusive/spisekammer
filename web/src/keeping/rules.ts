// How long a thing keeps (S-003, S-010). Pure and tested (rules.test.ts); the ground rules are
// written up for users on the "Sådan regner appen" page and in docs/ARCHITECTURE.md §3.
//
// 1. The package date comes first. "Sidste anvendelsesdato" (use by) is never extended outside the
//    freezer: after opening or thawing, the earlier of it and the estimate applies. "Bedst før"
//    (best before) is shown until the thing is opened; then the estimate takes over.
// 2. Without a package date, the estimate: the day it came into its place (or was opened, or
//    thawed) plus the LOW end of FoodKeeper's range for that place.
// 3. Into the freezer: a new clock, the freezer time from the day it went in.
//    Out of the freezer into the fridge: the after-thawing time, else the fridge time, from that day.
// 4. Where FoodKeeper has no time, or advises against the place, there is no date, only a note.

import type { PlaceKind } from '../places';
import type { FoodType, Span, Time, TimeKey } from './types';

export type PackageKind = 'useBy' | 'bestBefore';

export interface KeepInput {
  type?: FoodType | undefined;
  place: PlaceKind;
  placedOn: string; // yyyy-mm-dd, the day it came into this place
  openedOn?: string | undefined;
  thawedOn?: string | undefined; // the day it came out of the freezer into the fridge
  packageDate?: string | undefined;
  packageKind?: PackageKind | undefined;
}

export type KeepNote =
  | 'noType' // we do not know what it is
  | 'noTime' // FoodKeeper has no time for this place
  | 'notRecommended' // FoodKeeper advises against this place
  | 'indefinitely' // keeps for a very long time
  | 'whenRipe' // fruit on the counter: until ripe
  | 'fridgeAfterOpening' // opened, and FoodKeeper only has a time in the fridge
  | 'packageOnly' // FoodKeeper says: the package's date (milk, crème fraîche)
  | 'roomHours'; // FoodKeeper gives only hours outside the fridge

export interface Keeping {
  by: string | null; // use by about this day, or null when no date can be given
  upTo?: string; // the high end of the estimate's range, when it has one
  source: 'useBy' | 'bestBefore' | 'estimate' | 'none';
  basis?: TimeKey; // which FoodKeeper time the estimate comes from
  note?: KeepNote;
  hours?: number; // with 'roomHours'
}

// --- Dates as yyyy-mm-dd, counted in UTC so time zones and summer time cannot shift a day.

const toDate = (day: string) => new Date(`${day}T00:00:00Z`);
const toDay = (d: Date) => d.toISOString().slice(0, 10);

export function addTime(day: string, amount: number, unit: Span['unit']): string {
  const d = toDate(day);
  if (unit === 'hours') return day; // less than a day counts as the same day
  if (unit === 'days') d.setUTCDate(d.getUTCDate() + amount);
  else if (unit === 'weeks') d.setUTCDate(d.getUTCDate() + 7 * amount);
  else {
    // Months and years: the same day of the month, or the month's last day if it has fewer days.
    const months = unit === 'months' ? amount : 12 * amount;
    const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
    const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
    target.setUTCDate(Math.min(d.getUTCDate(), last));
    return toDay(target);
  }
  return toDay(d);
}

export const daysBetween = (from: string, to: string) => Math.round((toDate(to).getTime() - toDate(from).getTime()) / 86_400_000);
const later = (a: string, b: string) => (a >= b ? a : b);

const isSpan = (t: Time | undefined): t is Span => typeof t === 'object';

// An estimate from one FoodKeeper time, counted from a day.
function fromTime(time: Time | undefined, start: string, basis: TimeKey): Keeping {
  if (time === undefined) return { by: null, source: 'none', note: 'noTime' };
  if (time === 'notRecommended') return { by: null, source: 'none', note: 'notRecommended', basis };
  if (time === 'indefinitely') return { by: null, source: 'none', note: 'indefinitely', basis };
  if (time === 'whenRipe') return { by: null, source: 'none', note: 'whenRipe', basis };
  if (time === 'useBy') return { by: null, source: 'none', note: 'packageOnly', basis }; // only the package's date
  if (time.unit === 'hours') return { by: start, source: 'estimate', basis, note: 'roomHours', hours: time.min };
  const by = addTime(start, time.min, time.unit);
  const upTo = addTime(start, time.max, time.unit);
  return upTo === by ? { by, source: 'estimate', basis } : { by, upTo, source: 'estimate', basis };
}

// The estimate alone, without the package date.
export function estimate(input: KeepInput): Keeping {
  const { type, place, placedOn, openedOn, thawedOn } = input;
  if (!type) return { by: null, source: 'none', note: 'noType' };
  const t = type.times;

  if (place === 'freezer') return fromTime(t.freezer, placedOn, 'freezer');

  if (place === 'fridge' && thawedOn) {
    // Thawed in the fridge: the after-thawing time, else the fridge time, from the day it came out.
    const start = later(thawedOn, placedOn);
    return isSpan(t.fridgeThawed) ? fromTime(t.fridgeThawed, start, 'fridgeThawed') : fromTime(t.fridge, start, 'fridge');
  }

  if (openedOn) {
    const opened: TimeKey = place === 'fridge' ? 'fridgeOpened' : 'pantryOpened';
    if (t[opened] !== undefined) return fromTime(t[opened], later(openedOn, placedOn), opened);
    // Opened in the pantry, and FoodKeeper only has a time for it opened in the fridge.
    if (place === 'pantry' && t.fridgeOpened !== undefined && t.fridgeOpened !== 'notRecommended') return { by: null, source: 'none', note: 'fridgeAfterOpening' };
  }

  return fromTime(t[place], placedOn, place);
}

// What the app shows: the package date first, then the estimate (rule 1).
export function keeping(input: KeepInput): Keeping {
  const est = estimate(input);
  const { packageDate, packageKind, place, openedOn, thawedOn } = input;
  if (!packageDate || !packageKind || place === 'freezer') return est;

  const changed = Boolean(openedOn) || (place === 'fridge' && Boolean(thawedOn));
  // A note stays when it matters with the package date too: a place advised against, or an opened
  // or thawed thing with no estimate of its own (then the package date is all there is).
  const carry = est.note && (est.note === 'notRecommended' || (changed && est.by === null && est.note !== 'packageOnly')) ? { note: est.note } : {};
  if (packageKind === 'useBy') {
    // Never later than the use-by date; earlier when the estimate after opening or thawing is.
    if (changed && est.by !== null && est.by < packageDate) return est;
    return { by: packageDate, source: 'useBy', ...carry };
  }
  // Best before: the date until it is opened, then the estimate (if there is one).
  if (changed && est.by !== null) return est;
  return { by: packageDate, source: 'bestBefore', ...carry };
}

// How soon to use it, for "Brug snart" and the colour of the line. The window is longer where
// things keep longer: a few days in the fridge, two weeks in the pantry, a month in the freezer.
export type Urgency = 'past' | 'today' | 'soon' | 'later' | 'unknown';
const SOON_DAYS: Record<PlaceKind, number> = { fridge: 3, pantry: 14, freezer: 30 };

export function urgency(k: Keeping, place: PlaceKind, today: string): Urgency {
  if (k.by === null) return 'unknown';
  const left = daysBetween(today, k.by);
  if (left < 0) return 'past';
  if (left === 0) return 'today';
  return left <= SOON_DAYS[place] ? 'soon' : 'later';
}

// The words to add, beyond the date: raw meat and fish, leftovers and anything with a use-by date
// get "Ved tvivl: smid ud" (when in doubt, throw it out).
export function inDoubtThrowOut(k: Keeping, type: FoodType | undefined, place: PlaceKind): boolean {
  if (place === 'freezer') return false;
  if (k.source === 'useBy') return true;
  return type !== undefined && ['meat', 'poultry', 'fish', 'leftovers'].includes(type.category);
}
