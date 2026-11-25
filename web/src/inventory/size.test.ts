import { describe, expect, it } from 'vitest';
import { formatSize, parseSize, sizeFromInput, sizeText, splitUnit } from './size';

describe('Forråd sizes', () => {
  it('reads a number and a unit, written the ways packs write them', () => {
    expect(parseSize('400 g')).toEqual({ amount: 400, unit: 'g' });
    expect(parseSize('400g')).toEqual({ amount: 400, unit: 'g' });
    expect(parseSize('1,5 l')).toEqual({ amount: 1.5, unit: 'l' });
    expect(parseSize('1.5L')).toEqual({ amount: 1.5, unit: 'l' });
    expect(parseSize('33 cl ℮')).toEqual({ amount: 33, unit: 'cl' });
    expect(parseSize('500 g e')).toEqual({ amount: 500, unit: 'g' });
    expect(parseSize('1 kilo')).toEqual({ amount: 1, unit: 'kg' });
    expect(parseSize('2 Liter')).toEqual({ amount: 2, unit: 'l' });
    expect(parseSize('12 stk.')).toEqual({ amount: 12, unit: 'stk' });
    expect(parseSize('10 pcs')).toEqual({ amount: 10, unit: 'stk' });
    expect(parseSize('1.000 g')).toEqual({ amount: 1000, unit: 'g' });
  });

  it('reads packs and cans (S-022)', () => {
    expect(parseSize('1 pakke')).toEqual({ amount: 1, unit: 'pk' });
    expect(parseSize('2 pk.')).toEqual({ amount: 2, unit: 'pk' });
    expect(parseSize('2 dåser')).toEqual({ amount: 2, unit: 'dåse' });
    expect(parseSize('3 cans')).toEqual({ amount: 3, unit: 'dåse' });
  });

  it('reads a multipack as a count and the size of each one', () => {
    expect(parseSize('6 x 1,5 l')).toEqual({ amount: 1.5, unit: 'l', count: 6 });
    expect(parseSize('4×125 g')).toEqual({ amount: 125, unit: 'g', count: 4 });
    expect(parseSize('1,5 l x 6')).toEqual({ amount: 1.5, unit: 'l', count: 6 });
    expect(parseSize('1 x 400 g')).toEqual({ amount: 400, unit: 'g' });
  });

  it('leaves text it cannot read alone', () => {
    for (const text of ['stor', 'familiepakke', '0 g', '400', 'g', '2,5 x 3 l', '']) expect(parseSize(text)).toBeNull();
  });

  it('shows and writes a size', () => {
    const label = (u: string) => (u === 'stk' ? 'stk.' : u);
    expect(formatSize({ amount: 1.5, unit: 'l' }, 'da', label)).toBe('1,5 l');
    expect(formatSize({ amount: 0.33, unit: 'l' }, 'en', label)).toBe('0.33 l');
    expect(formatSize({ amount: 10, unit: 'stk' }, 'da', label)).toBe('10 stk.');
    expect(parseSize(sizeText({ amount: 0.33, unit: 'l' }))).toEqual({ amount: 0.33, unit: 'l' });
  });
});

describe('the size field (S-022)', () => {
  it('moves a typed unit to the dropdown', () => {
    expect(splitUnit('500 g')).toEqual({ amountText: '500', unit: 'g' });
    expect(splitUnit('1,5 l')).toEqual({ amountText: '1,5', unit: 'l' });
    expect(splitUnit('2 dåser')).toEqual({ amountText: '2', unit: 'dåse' });
    expect(splitUnit('500')).toBeNull();
    expect(splitUnit('500 k')).toBeNull();
    expect(splitUnit('6 x 1,5 l')).toBeNull();
  });
  it('reads what the field holds', () => {
    expect(sizeFromInput('500', 'g')).toEqual({ amount: 500, unit: 'g' });
    expect(sizeFromInput('1,5', 'l')).toEqual({ amount: 1.5, unit: 'l' });
    expect(sizeFromInput('6 x 1,5 l', 'g')).toEqual({ amount: 1.5, unit: 'l', count: 6 });
    expect(sizeFromInput('6 x 1,5', 'l')).toEqual({ amount: 1.5, unit: 'l', count: 6 });
    expect(sizeFromInput('stor', 'g')).toEqual({ sizeText: 'stor' });
    expect(sizeFromInput('  ', 'g')).toBeNull();
    expect(sizeFromInput('0', 'g')).toBeNull();
  });
});
