import { describe, expect, it } from 'vitest';
import { resultOf } from './checkResult';

describe('Søg efter ny version (D-065)', () => {
  it('finds a new version when one is installing or waiting, otherwise this is the latest', () => {
    expect(resultOf({ installing: null, waiting: null })).toBe('latest');
    expect(resultOf({ installing: {}, waiting: null })).toBe('found');
    expect(resultOf({ installing: null, waiting: {} })).toBe('found');
  });
});
