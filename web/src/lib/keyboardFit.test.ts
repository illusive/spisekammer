import { describe, expect, it } from 'vitest';
import { keyboardFit } from './keyboardFit';

// An iPhone 13-ish screen: 844 px of layout viewport; the keyboard leaves about 450 px.
describe('a sheet and the keyboard (S-017)', () => {
  it('stays where it is when there is no keyboard', () => {
    expect(keyboardFit({ layoutHeight: 844, visibleTop: 0, visibleHeight: 844 })).toBeNull();
    expect(keyboardFit({ layoutHeight: 844, visibleTop: 0, visibleHeight: 790 })).toBeNull(); // a toolbar, not a keyboard
  });

  it('is lifted above the keyboard and kept to the visible height', () => {
    // The bottom of the sheet ends where the visible area ends: 844 - 394 = 450.
    expect(keyboardFit({ layoutHeight: 844, visibleTop: 0, visibleHeight: 450 })).toEqual({ lift: 394, maxHeight: 438 });
  });

  it('follows the visible area when the phone has panned down to a field', () => {
    // Visible from 200 to 650 of the layout viewport: the sheet's bottom goes to 650.
    expect(keyboardFit({ layoutHeight: 844, visibleTop: 200, visibleHeight: 450 })).toEqual({ lift: 194, maxHeight: 438 });
  });

  it('never moves on numbers that make no sense', () => {
    expect(keyboardFit({ layoutHeight: 0, visibleTop: 0, visibleHeight: 450 })).toBeNull();
    expect(keyboardFit({ layoutHeight: 844, visibleTop: Number.NaN, visibleHeight: 450 })).toBeNull();
    expect(keyboardFit({ layoutHeight: 844, visibleTop: 0, visibleHeight: 0 })).toBeNull();
    expect(keyboardFit({ layoutHeight: 844, visibleTop: 500, visibleHeight: 450 })).toBeNull(); // nothing covered
  });
});
