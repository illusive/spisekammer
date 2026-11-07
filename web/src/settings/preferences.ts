// Language and appearance either follow the phone or are fixed by the user, kept on the device
// (from stead's D-044). Text size always follows the phone.

import { useEffect, useState } from 'react';
import { createLocalStore } from '../lib/localStore';

export type LangPref = 'system' | 'da' | 'en';
export type ThemePref = 'system' | 'light' | 'dark';

export interface Preferences {
  lang: LangPref;
  theme: ThemePref;
}

const DEFAULTS: Preferences = { lang: 'system', theme: 'system' };

const store = createLocalStore<Preferences>({
  key: 'spisekammer.preferences.v1',
  parse: (stored) => {
    const p = (stored ?? {}) as Partial<Record<keyof Preferences, unknown>>;
    return {
      lang: p.lang === 'da' || p.lang === 'en' ? p.lang : DEFAULTS.lang,
      theme: p.theme === 'light' || p.theme === 'dark' ? p.theme : DEFAULTS.theme,
    };
  },
});

export const usePreferences = store.use;

export function setPreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
  store.update((current) => ({ ...current, [key]: value }));
}

const DARK_QUERY = '(prefers-color-scheme: dark)';

function useSystemDark(): boolean {
  const [dark, setDark] = useState(() => matchMedia(DARK_QUERY).matches);
  useEffect(() => {
    const list = matchMedia(DARK_QUERY);
    const update = () => setDark(list.matches);
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, []);
  return dark;
}

export function useDarkMode(): boolean {
  const { theme } = usePreferences();
  const systemDark = useSystemDark();
  return theme === 'system' ? systemDark : theme === 'dark';
}

// The tokens in index.css switch on data-theme; the status bar colour follows. index.html sets the
// same before the first paint, so there is no flash.
export function useApplyTheme() {
  const dark = useDarkMode();
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
      meta.content = dark ? '#1a1915' : '#f6f1e7';
    }
  }, [dark]);
}

// The interface language: the user's choice, else the phone's (Danish unless it prefers English).
export function useLang(): 'da' | 'en' {
  const { lang } = usePreferences();
  if (lang !== 'system') return lang;
  return typeof navigator !== 'undefined' && /^en\b/i.test(navigator.language) ? 'en' : 'da';
}
