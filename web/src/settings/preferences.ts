// The language follows the phone or is fixed by the user, kept on the device (from stead's D-044).
// Text size always follows the phone. The look is light only (S-023).

import { createLocalStore } from '../lib/localStore';

export type LangPref = 'system' | 'da' | 'en';

export interface Preferences {
  lang: LangPref;
  // The old fridge switch (S-007). Only read once, to keep a fridge place for phones that had it
  // on (S-013 replaced it with places of the kind Køl).
  fridge: boolean;
  onboarded: boolean; // the first-run steps are done or skipped (S-015)
  // How places are listed: alphabetical until the user first moves one (S-019, S-022).
  placeOrder: 'alphabetical' | 'own';
  lastPlaceId: string | null; // where the last thing was added, the add form's starting place (S-022)
}

const DEFAULTS: Preferences = { lang: 'system', fridge: false, onboarded: false, placeOrder: 'alphabetical', lastPlaceId: null };

const store = createLocalStore<Preferences>({
  key: 'spisekammer.preferences.v1',
  parse: (stored) => {
    const p = (stored ?? {}) as Partial<Record<keyof Preferences, unknown>>;
    return {
      lang: p.lang === 'da' || p.lang === 'en' ? p.lang : DEFAULTS.lang,
      fridge: p.fridge === true,
      onboarded: p.onboarded === true,
      placeOrder: p.placeOrder === 'own' ? 'own' : 'alphabetical',
      lastPlaceId: typeof p.lastPlaceId === 'string' && p.lastPlaceId.length <= 64 ? p.lastPlaceId : null,
    };
  },
});

export const usePreferences = store.use;
export const readPreferences = store.get;

export function setPreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
  store.update((current) => ({ ...current, [key]: value }));
}

// The interface language: the user's choice, else the phone's (Danish unless it prefers English).
export function useLang(): 'da' | 'en' {
  const { lang } = usePreferences();
  if (lang !== 'system') return lang;
  return typeof navigator !== 'undefined' && /^en\b/i.test(navigator.language) ? 'en' : 'da';
}
