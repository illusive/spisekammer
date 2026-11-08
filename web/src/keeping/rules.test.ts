import { describe, expect, it } from 'vitest';
import type { PlaceKind } from '../places';
import { FOOD_TYPES, foodType, matchFoodType } from './foodTypes';
import { addTime, daysBetween, estimate, inDoubtThrowOut, keeping, urgency, type KeepInput } from './rules';

const type = (fk: number) => {
  const t = foodType(`fk-${fk}`);
  if (!t) throw new Error(`no type fk-${fk}`);
  return t;
};
const CHICKEN_BREAST = type(117);
const MINCED_BEEF = type(43);
const JAM = type(347);
const MILK = type(27);
const BREAD = type(195);
const LEFTOVERS = type(173);
const EGGS = type(21);
const NUGGETS = type(134);

describe('dates', () => {
  it('adds days, weeks, months and years', () => {
    expect(addTime('2026-11-07', 2, 'days')).toBe('2026-11-09');
    expect(addTime('2026-11-07', 1, 'weeks')).toBe('2026-11-14');
    expect(addTime('2026-11-07', 9, 'months')).toBe('2027-08-07');
    expect(addTime('2026-11-07', 2, 'years')).toBe('2028-11-07');
    expect(addTime('2026-11-07', 3, 'hours')).toBe('2026-11-07');
  });
  it('keeps to the last day of a shorter month', () => {
    expect(addTime('2026-01-31', 1, 'months')).toBe('2026-02-28');
    expect(addTime('2028-02-29', 1, 'years')).toBe('2029-02-28');
  });
  it('counts days across summer time', () => {
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2);
    expect(daysBetween('2026-11-09', '2026-11-07')).toBe(-2);
  });
});

describe('the fixed examples (FoodKeeper v128)', () => {
  it('raw chicken breast in the freezer: 8 months from the day it went in (Tænk; FoodKeeper says 9)', () => {
    expect(estimate({ type: CHICKEN_BREAST, place: 'freezer', placedOn: '2026-11-07' })).toMatchObject({ by: '2027-07-07', upTo: '2027-09-07', source: 'estimate', basis: 'freezer' });
    expect(CHICKEN_BREAST.danish?.freezer).toMatch(/Kylling/);
  });
  it('minced beef in the fridge: the low end, 1 day (range to 2)', () => {
    expect(estimate({ type: MINCED_BEEF, place: 'fridge', placedOn: '2026-11-07' })).toEqual({ by: '2026-11-08', upTo: '2026-11-09', source: 'estimate', basis: 'fridge' });
  });
  it('minced beef in the freezer: 3 months (range to 4)', () => {
    expect(estimate({ type: MINCED_BEEF, place: 'freezer', placedOn: '2026-11-07' })).toMatchObject({ by: '2027-02-07', upTo: '2027-03-07' });
  });
  it('jam: 6 months unopened in the pantry, 6 months opened in the fridge', () => {
    expect(estimate({ type: JAM, place: 'pantry', placedOn: '2026-11-07' })).toMatchObject({ by: '2027-05-07', basis: 'pantry' });
    expect(estimate({ type: JAM, place: 'fridge', placedOn: '2026-11-07', openedOn: '2026-12-01' })).toMatchObject({ by: '2027-06-01', basis: 'fridgeOpened' });
  });
  it('opened jam left in the pantry: no date, it belongs in the fridge', () => {
    expect(estimate({ type: JAM, place: 'pantry', placedOn: '2026-11-07', openedOn: '2026-12-01' })).toEqual({ by: null, source: 'none', note: 'fridgeAfterOpening' });
  });
  it('milk: only the package date', () => {
    expect(estimate({ type: MILK, place: 'fridge', placedOn: '2026-11-07' })).toMatchObject({ by: null, note: 'packageOnly' });
    expect(keeping({ type: MILK, place: 'fridge', placedOn: '2026-11-07', packageDate: '2026-11-12', packageKind: 'useBy' })).toEqual({ by: '2026-11-12', source: 'useBy' });
  });
  it('out of the freezer: the fridge time from the day it came out, for raw chicken', () => {
    expect(estimate({ type: CHICKEN_BREAST, place: 'fridge', placedOn: '2026-11-10', thawedOn: '2026-11-10' })).toMatchObject({ by: '2026-11-11', basis: 'fridge' });
  });
  it('out of the freezer: the after-thawing time where FoodKeeper has one', () => {
    expect(estimate({ type: NUGGETS, place: 'fridge', placedOn: '2026-11-10', thawedOn: '2026-11-10' })).toMatchObject({ by: '2026-11-11', basis: 'fridgeThawed' });
  });
  it('leftovers: 3 days in the fridge, 1 month in the freezer (Tænk’s ready meals; FoodKeeper says 2)', () => {
    expect(estimate({ type: LEFTOVERS, place: 'fridge', placedOn: '2026-11-07' })).toMatchObject({ by: '2026-11-10', upTo: '2026-11-11' });
    expect(estimate({ type: LEFTOVERS, place: 'freezer', placedOn: '2026-11-07' })).toMatchObject({ by: '2026-12-07', upTo: '2027-02-07' });
  });
});

describe('notes instead of a date', () => {
  it('eggs in the freezer are not recommended', () => {
    expect(estimate({ type: EGGS, place: 'freezer', placedOn: '2026-11-07' })).toMatchObject({ by: null, note: 'notRecommended' });
  });
  it('a place FoodKeeper has no time for', () => {
    expect(estimate({ type: MINCED_BEEF, place: 'pantry', placedOn: '2026-11-07' })).toMatchObject({ by: null, note: 'noTime' });
  });
  it('an unknown type', () => {
    expect(keeping({ place: 'pantry', placedOn: '2026-11-07' })).toEqual({ by: null, source: 'none', note: 'noType' });
  });
});

describe('the package date comes first', () => {
  const bread = { type: BREAD, place: 'pantry', placedOn: '2026-11-07' } as const;
  it('best before is shown while unopened, even when the estimate is earlier', () => {
    expect(keeping({ ...bread, packageDate: '2026-11-30', packageKind: 'bestBefore' })).toEqual({ by: '2026-11-30', source: 'bestBefore' });
  });
  it('opened with no estimate of its own: the package date, and a note why', () => {
    expect(keeping({ type: MILK, place: 'pantry', placedOn: '2026-11-07', openedOn: '2026-11-08', packageDate: '2026-11-09', packageKind: 'bestBefore' })).toEqual({ by: '2026-11-09', source: 'bestBefore', note: 'noTime' });
    expect(keeping({ type: MILK, place: 'fridge', placedOn: '2026-11-07', packageDate: '2026-11-09', packageKind: 'bestBefore' })).toEqual({ by: '2026-11-09', source: 'bestBefore' });
  });
  it('a use-by date is used as it is while unopened', () => {
    expect(keeping({ type: MINCED_BEEF, place: 'fridge', placedOn: '2026-11-07', packageDate: '2026-11-11', packageKind: 'useBy' })).toEqual({ by: '2026-11-11', source: 'useBy' });
  });
  it('opened: the earlier of the use-by date and the opened estimate', () => {
    const jam = { type: JAM, place: 'fridge', placedOn: '2026-11-07', openedOn: '2026-11-08', packageKind: 'useBy' } as const;
    expect(keeping({ ...jam, packageDate: '2026-12-01' }).by).toBe('2026-12-01');
    expect(keeping({ ...jam, packageDate: '2028-01-01' })).toMatchObject({ by: '2027-05-08', source: 'estimate' });
  });
  it('the freezer starts a new clock over a use-by date', () => {
    expect(keeping({ type: MINCED_BEEF, place: 'freezer', placedOn: '2026-11-07', packageDate: '2026-11-09', packageKind: 'useBy' })).toMatchObject({ by: '2027-02-07', source: 'estimate' });
  });
  it('in the freezer, a best-before date is the frozen food’s own and is shown', () => {
    expect(keeping({ type: type(331), place: 'freezer', placedOn: '2026-11-07', packageDate: '2028-03-01', packageKind: 'bestBefore' })).toEqual({ by: '2028-03-01', source: 'bestBefore' });
  });

  it('never gives a later day than the use-by date outside the freezer (all types, places and states)', () => {
    const places: PlaceKind[] = ['fridge', 'pantry'];
    const packageDate = '2026-11-15';
    for (const t of FOOD_TYPES) {
      for (const place of places) {
        for (const state of [{}, { openedOn: '2026-11-08' }, { thawedOn: '2026-11-09' }, { openedOn: '2026-11-08', thawedOn: '2026-11-09' }]) {
          const input: KeepInput = { type: t, place, placedOn: '2026-11-07', packageDate, packageKind: 'useBy', ...state };
          const k = keeping(input);
          expect(k.by, `${t.id} ${place} ${JSON.stringify(state)}`).not.toBeNull();
          expect(k.by! <= packageDate, `${t.id} ${place} ${JSON.stringify(state)}: ${k.by}`).toBe(true);
        }
      }
    }
  });
});

describe('how soon', () => {
  const k = (by: string) => ({ by, source: 'estimate' as const });
  it('past, today, soon and later, with a longer window in the freezer', () => {
    expect(urgency(k('2026-11-06'), 'fridge', '2026-11-07')).toBe('past');
    expect(urgency(k('2026-11-07'), 'fridge', '2026-11-07')).toBe('today');
    expect(urgency(k('2026-11-10'), 'fridge', '2026-11-07')).toBe('soon');
    expect(urgency(k('2026-11-11'), 'fridge', '2026-11-07')).toBe('later');
    expect(urgency(k('2026-12-01'), 'freezer', '2026-11-07')).toBe('soon');
    expect(urgency({ by: null, source: 'none' }, 'pantry', '2026-11-07')).toBe('unknown');
  });
  it('"Ved tvivl: smid ud" for raw meat, leftovers and use-by dates, not in the freezer', () => {
    expect(inDoubtThrowOut(k('2026-11-08'), MINCED_BEEF, 'fridge')).toBe(true);
    expect(inDoubtThrowOut(k('2026-11-08'), MINCED_BEEF, 'freezer')).toBe(false);
    expect(inDoubtThrowOut({ by: '2026-11-08', source: 'useBy' }, MILK, 'fridge')).toBe(true);
    expect(inDoubtThrowOut(k('2027-05-07'), JAM, 'pantry')).toBe(false);
  });
});

describe('finding the food type from a name', () => {
  const id = (name: string) => matchFoodType(name)?.id;
  it('finds the common things', () => {
    expect(id('Kyllingebryst')).toBe('fk-117');
    expect(id('Frosne kyllingebryst')).toBe('fk-117');
    expect(id('Hakket oksekød 8-12%')).toBe('fk-43');
    expect(id('Oksekød, hakket 4-7%')).toBe('fk-43');
    expect(id('Letmælk')).toBe('fk-27');
    expect(id('Hakkede tomater')).toBe('fk-373');
    expect(id('Jordbærsyltetøj')).toBe('fk-347');
    expect(id('Røget laks')).toBe('fk-167');
    expect(id('Laks')).toBe('fk-146');
    expect(id('Frosne ærter')).toBe('fk-331');
    expect(id('Æbler')).toBe('fk-248');
    expect(id('Æble')).toBe('fk-248');
    expect(id('Rugbrød')).toBe('fk-195');
    expect(id('Vaniljeis')).toBe('fk-317');
  });
  it('lets the more specific key win', () => {
    expect(id('Kyllingefond')).toBe('fk-672');
    expect(id('Kyllingebryst pålæg')).toBe('fk-517');
    expect(id('Pølsebrød')).toBe('fk-195');
    expect(id('Tomatpuré')).toBe('fk-501');
    expect(id('Søde kartofler')).toBe('fk-422');
    expect(id('Kogte kartofler')).toBe('fk-174');
  });
  it('keeps whole-word keys whole', () => {
    expect(id('Is')).toBe('fk-317');
    expect(id('Isbergsalat')).not.toBe('fk-317');
    expect(id('Sukkerfri cola')).toBe('fk-407');
  });
  it('finds nothing in a name it does not know', () => {
    expect(id('Opvaskemiddel')).toBeUndefined();
    expect(id('')).toBeUndefined();
  });
});
