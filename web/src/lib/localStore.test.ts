import { beforeEach, describe, expect, it } from 'vitest';
import { createLocalStore } from './localStore';

// A browser-like window and localStorage for Node.
const memory = new Map<string, string>();
let full = false;
beforeEach(() => {
  memory.clear();
  full = false;
  Object.assign(globalThis, {
    window: new EventTarget(),
    localStorage: {
      getItem: (k: string) => memory.get(k) ?? null,
      setItem: (k: string, v: string) => {
        if (full) throw new Error('QuotaExceededError');
        memory.set(k, v);
      },
    },
  });
});

const numbers = () => createLocalStore<number[]>({ key: 'stead.test', parse: (stored) => (Array.isArray(stored) ? stored.filter((n) => typeof n === 'number') : []) });

describe('localStore', () => {
  it('reads, validates and writes JSON', () => {
    memory.set('stead.test', JSON.stringify([1, 'x', 2]));
    const store = numbers();
    expect(store.get()).toEqual([1, 2]);
    store.update((list) => [...list, 3]);
    expect(JSON.parse(memory.get('stead.test')!)).toEqual([1, 2, 3]);
  });

  it('falls back on damaged data, and keeps a value in memory when storage is full', () => {
    memory.set('stead.test', '{broken');
    const store = numbers();
    expect(store.get()).toEqual([]);
    full = true;
    store.set([7]);
    expect(store.get()).toEqual([7]);
  });

  it('can store a plain switch as "1"/"0"', () => {
    const on = createLocalStore<boolean>({ key: 'stead.switch', parse: (s) => s === true, serialize: (v) => (v ? '1' : '0'), deserialize: (raw) => raw === '1' });
    on.set(true);
    expect(memory.get('stead.switch')).toBe('1');
    expect(createLocalStore<boolean>({ key: 'stead.switch', parse: (s) => s === true, deserialize: (raw) => raw === '1' }).get()).toBe(true);
  });
});
