// One value kept on the device in localStorage, shared by every component that uses it (D-026,
// D-044, D-046). All the app's own user data goes through this: bookmarks, preferences, Forråd,
// map switches, the compass course. Reads are validated by `parse`, so damaged or older data falls
// back instead of breaking a screen; writes that fail (private mode, full storage) keep the value
// in memory until the app closes. Other tabs' changes arrive through the `storage` event.

import { useSyncExternalStore } from 'react';

export interface LocalStore<T> {
  get(): T;
  set(value: T): void;
  update(change: (value: T) => T): void;
  use(): T;
}

export interface LocalStoreOptions<T> {
  key: string;
  // Turns what was stored (already JSON-parsed, or `undefined` when nothing is stored) into a valid value.
  parse: (stored: unknown) => T;
  // How the value is written and read back; JSON unless given (e.g. "1"/"0" for a plain switch).
  serialize?: (value: T) => string;
  deserialize?: (raw: string) => unknown;
}

export function createLocalStore<T>({ key, parse, serialize = JSON.stringify, deserialize = JSON.parse }: LocalStoreOptions<T>): LocalStore<T> {
  const changed = `spisekammer-store-changed:${key}`;
  let cache: { value: T } | null = null;

  const read = (): T => {
    try {
      const raw = localStorage.getItem(key);
      return parse(raw === null ? undefined : deserialize(raw));
    } catch {
      return parse(undefined);
    }
  };
  const get = () => (cache ??= { value: read() }).value;

  const set = (value: T) => {
    try {
      localStorage.setItem(key, serialize(value));
    } catch {
      // Storage blocked or full: the value lasts until the app closes.
    }
    cache = { value };
    window.dispatchEvent(new Event(changed));
  };

  const subscribe = (onChange: () => void) => {
    const fromOtherTab = (event: StorageEvent) => {
      if (event.key !== key && event.key !== null) return; // null: storage was cleared
      cache = null;
      onChange();
    };
    window.addEventListener(changed, onChange);
    window.addEventListener('storage', fromOtherTab);
    return () => {
      window.removeEventListener(changed, onChange);
      window.removeEventListener('storage', fromOtherTab);
    };
  };

  return {
    get,
    set,
    update: (change) => set(change(get())),
    use: () => useSyncExternalStore(subscribe, get),
  };
}

