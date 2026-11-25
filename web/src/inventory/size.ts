// Sizes (D-050, S-022): a number and a unit, read from a size text such as a product's on Open Food
// Facts ("400 g", "1,5 l", "33 cl ℮", "6 x 1,5 l") or typed into the size field ("500 g" moves the
// unit to the field's dropdown). A multipack gives a count and the size of each one. Text that
// cannot be read stays as text; nothing is guessed. Pure, for tests.

import { localeOf } from '../i18n/format';
import type { Lang } from '../i18n/strings';

// In the order the size field's dropdown lists them.
export const SIZE_UNITS = ['stk', 'pk', 'dåse', 'g', 'kg', 'ml', 'cl', 'dl', 'l'] as const;
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
  pk: 'pk', 'pk.': 'pk', pakke: 'pk', pakker: 'pk', pakning: 'pk', pakninger: 'pk', pack: 'pk', packs: 'pk', pakkung: 'pk',
  dåse: 'dåse', dåser: 'dåse', ds: 'dåse', 'ds.': 'dåse', can: 'dåse', cans: 'dåse', tin: 'dåse', tins: 'dåse', dose: 'dåse', dosen: 'dåse',
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
  const UNIT = '([a-zæøåäöüß]+\\.?)';
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

// The size field (S-022): a number with a unit dropdown. A unit typed with the number ("500 g",
// "2 dåser") moves to the dropdown, and the number stays in the field.
export function splitUnit(text: string): { amountText: string; unit: SizeUnit } | null {
  const read = parseSize(text);
  if (!read || read.count !== undefined) return null;
  const number = /^\s*(\d+(?:[.,]\d+)?)/.exec(text);
  return number?.[1] ? { amountText: number[1], unit: read.unit } : null;
}

// What the size field holds, read when the thing is saved: a number in the chosen unit, a size
// typed in full (a multipack gives a count too), or text that is not a size, kept as it is.
export function sizeFromInput(text: string, unit: SizeUnit): (Size & { count?: number }) | { sizeText: string } | null {
  const t = text.trim();
  if (!t) return null;
  if (/^\d+(?:[.,]\d+)?$/.test(t)) {
    const amount = Number(t.replace(',', '.'));
    return amount > 0 && amount <= MAX_AMOUNT ? { amount, unit } : null;
  }
  return parseSize(t) ?? parseSize(`${t} ${unit}`) ?? { sizeText: t.slice(0, 40) };
}
