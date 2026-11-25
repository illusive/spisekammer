import { describe, expect, it } from 'vitest';
import { daysBetween, monthEnd, precisionFor, urgency } from './rules';

describe('dates', () => {
  it('counts days across summer time', () => {
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2);
    expect(daysBetween('2026-11-09', '2026-11-07')).toBe(-2);
  });
  it('gives the last day of a month, leap years included', () => {
    expect(monthEnd(2027, 3)).toBe('2027-03-31');
    expect(monthEnd(2027, 2)).toBe('2027-02-28');
    expect(monthEnd(2028, 2)).toBe('2028-02-29');
    expect(monthEnd(2026, 12)).toBe('2026-12-31');
  });
  it('days in the fridge, months elsewhere', () => {
    expect(precisionFor('fridge')).toBe('day');
    expect(precisionFor('pantry')).toBe('month');
    expect(precisionFor('freezer')).toBe('month');
  });
});

describe('how soon', () => {
  it('past, today, soon and later, with a longer window in the freezer', () => {
    expect(urgency('2026-11-06', 'fridge', '2026-11-07')).toBe('past');
    expect(urgency('2026-11-07', 'fridge', '2026-11-07')).toBe('today');
    expect(urgency('2026-11-10', 'fridge', '2026-11-07')).toBe('soon');
    expect(urgency('2026-11-11', 'fridge', '2026-11-07')).toBe('later');
    expect(urgency('2026-12-01', 'freezer', '2026-11-07')).toBe('soon');
    expect(urgency(undefined, 'pantry', '2026-11-07')).toBe('unknown');
  });
  it('a month date counts to its last day', () => {
    // "nov. 2026" in the pantry is the 30th: soon (14 days) from the 16th, not overdue until December.
    expect(urgency(monthEnd(2026, 11), 'pantry', '2026-11-15')).toBe('later');
    expect(urgency(monthEnd(2026, 11), 'pantry', '2026-11-16')).toBe('soon');
    expect(urgency(monthEnd(2026, 11), 'pantry', '2026-11-30')).toBe('today');
    expect(urgency(monthEnd(2026, 11), 'pantry', '2026-12-01')).toBe('past');
  });
});
