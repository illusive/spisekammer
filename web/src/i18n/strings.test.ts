import { describe, expect, it } from 'vitest';
import { strings } from './strings';

// Every key in Danish has an English twin, and the other way round, at every level.
function shape(value: unknown): unknown {
  if (typeof value === 'function') return 'fn';
  if (typeof value === 'object' && value !== null) return Object.fromEntries(Object.keys(value).sort().map((k) => [k, shape((value as Record<string, unknown>)[k])]));
  return typeof value;
}

describe('strings', () => {
  it('Danish and English have the same keys', () => {
    expect(shape(strings.en)).toEqual(shape(strings.da));
  });
});
