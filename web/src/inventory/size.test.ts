import { describe, expect, it } from 'vitest';
import { formatSize, parseSize, sizeText } from './size';

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

  it('reads a multipack as a count and the size of each one', () => {
    expect(parseSize('6 x 1,5 l')).toEqual({ amount: 1.5, unit: 'l', count: 6 });
    expect(parseSize('4×125 g')).toEqual({ amount: 125, unit: 'g', count: 4 });
    expect(parseSize('1,5 l x 6')).toEqual({ amount: 1.5, unit: 'l', count: 6 });
    expect(parseSize('1 x 400 g')).toEqual({ amount: 400, unit: 'g' });
  });

  it('leaves text it cannot read alone', () => {
    for (const text of ['stor', 'familiepakke', '1 pakke', '0 g', '400', 'g', '2,5 x 3 l', '']) expect(parseSize(text)).toBeNull();
  });

  it('shows and writes a size', () => {
    const label = (u: string) => (u === 'stk' ? 'stk.' : u);
    expect(formatSize({ amount: 1.5, unit: 'l' }, 'da', label)).toBe('1,5 l');
    expect(formatSize({ amount: 0.33, unit: 'l' }, 'en', label)).toBe('0.33 l');
    expect(formatSize({ amount: 10, unit: 'stk' }, 'da', label)).toBe('10 stk.');
    expect(parseSize(sizeText({ amount: 0.33, unit: 'l' }))).toEqual({ amount: 0.33, unit: 'l' });
  });
});
