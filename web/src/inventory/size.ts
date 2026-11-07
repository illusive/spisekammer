// Sizes in Forråd (D-050): a number and a unit, read from a size text such as a product's on Open
// Food Facts ("400 g", "1,5 l", "33 cl ℮", "6 x 1,5 l"). A multipack gives a count and the size of
// each one. Text that cannot be read stays as text; nothing is guessed. Pure, for tests.

import { localeOf } from '../i18n/format';
import type { Lang } from '../i18n/strings';

export const SIZE_UNITS = ['g', 'kg', 'ml', 'cl', 'dl', 'l', 'stk'] as const;
export type SizeUnit = (typeof SIZE_UNITS)[number];

export interface Size {
  amount: number;
  unit: SizeUnit;
}

const MAX_AMOUNT = 100_000;
const MAX_PACK = 999;

// The ways a unit is written on packs and in Open Food Facts (Danish, English, German).
const ALIASES: Record<string, SizeUnit> = {
  g: 'g', gr: 'g', gram: 'g', grams: 'g', gramm: 'g',
  kg: 'kg', kilo: 'kg', kilogram: 'kg',
  ml: 'ml', cl: 'cl', dl: 'dl',
  l: 'l', lt: 'l', ltr: 'l', liter: 'l', litre: 'l', liters: 'l', litres: 'l',
  stk: 'stk', 'stk.': 'stk', st: 'stk', pcs: 'stk', pc: 'stk', pieces: 'stk', stück: 'stk',
};

const unitOf = (text: string): SizeUnit | undefined => ALIASES[text];

// "1,5" and "1.5" are one and a half; "1.000 g" is a thousand grams (a thousands point).
function number(text: string, unit: SizeUnit): number {
  if (/^\d{1,3}\.\d{3}$/.test(text) && (unit === 'g' || unit === 'ml')) return Number(text.replace('.', ''));
  return Number(text.replace(',', '.'));
}

export function parseSize(text: string): (Size & { count?: number }) | null {
  const t = text
    .toLowerCase()
    .replace(/℮/g, ' ')
    .replace(/[×*]/g, 'x')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/ e$/, ''); // the ℮ mark written as a letter: "500 g e"
  const NUM = '(\\d+(?:[.,]\\d+)?)';
  const UNIT = '([a-zäöüß]+\\.?)';
  const make = (amountText: string, unitText: string, countText?: string) => {
    const unit = unitOf(unitText);
    if (!unit) return null;
    const amount = number(amountText, unit);
    if (!(amount > 0 && amount <= MAX_AMOUNT)) return null;
    if (countText === undefined) return { amount, unit };
    const count = Number(countText);
    if (!Number.isInteger(count) || count < 1 || count > MAX_PACK) return null;
    return count === 1 ? { amount, unit } : { amount, unit, count };
  };
  let m = new RegExp(`^${NUM} ?x ?${NUM} ?${UNIT}$`).exec(t); // 6 x 1,5 l
  if (m) return make(m[2]!, m[3]!, m[1]);
  m = new RegExp(`^${NUM} ?${UNIT} ?x ?${NUM}$`).exec(t); // 1,5 l x 6
  if (m) return make(m[1]!, m[2]!, m[3]);
  m = new RegExp(`^${NUM} ?${UNIT}$`).exec(t); // 400 g
  if (m) return make(m[1]!, m[2]!);
  return null;
}

// "1,5 l" in Danish, "1.5 l" in English; `label` names the unit ("stk." or "pcs").
export function formatSize(size: Size, lang: Lang, label: (unit: SizeUnit) => string): string {
  return `${new Intl.NumberFormat(localeOf(lang), { maximumFractionDigits: 2 }).format(size.amount)} ${label(size.unit)}`;
}

// The same size as plain text that parseSize reads back, e.g. to remember with a barcode.
export const sizeText = (size: Size) => `${size.amount} ${size.unit}`;
