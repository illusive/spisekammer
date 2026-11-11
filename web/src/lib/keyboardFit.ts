// Where a bottom sheet goes when the keyboard is open (S-016, S-017). Pure, so the cases from an
// iPhone can be tested without one.
//
// All numbers are CSS pixels in the layout viewport, which position: fixed is measured against:
// - layoutHeight: the layout viewport's height (document.documentElement.clientHeight). It stays
//   the same when the keyboard opens. (window.innerHeight does not: on an iPhone it shrinks with
//   the keyboard, which is why measuring with it left the sheet behind the keyboard.)
// - visibleTop, visibleHeight: the visual viewport, the part the user sees above the keyboard.
//
// Returns null when nothing covers the bottom: then the sheet stays exactly where CSS puts it.
// Otherwise it is lifted by what the keyboard covers, never more, and kept to the visible height.

export const KEYBOARD_MIN_PX = 120; // less than this is a toolbar or rounding, not a keyboard
const GAP_PX = 12; // space between the sheet's top and the top of the visible area

export interface Viewports {
  layoutHeight: number;
  visibleTop: number;
  visibleHeight: number;
}

export function keyboardFit({ layoutHeight, visibleTop, visibleHeight }: Viewports): { lift: number; maxHeight: number } | null {
  if (![layoutHeight, visibleTop, visibleHeight].every(Number.isFinite) || layoutHeight <= 0 || visibleHeight <= 0) return null;
  const covered = layoutHeight - (visibleTop + visibleHeight);
  if (covered < KEYBOARD_MIN_PX) return null;
  return { lift: Math.round(covered), maxHeight: Math.max(160, Math.round(visibleHeight - GAP_PX)) };
}
