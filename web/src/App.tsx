// The app shell: language and appearance, the inventory loaded once, the update banner, and the
// screen for the route.

import { lazy, Suspense, useEffect } from 'react';
import { strings } from './i18n/strings';
import { loadInventory } from './inventory/store';
import { UpdateBanner } from './pwa/UpdateBanner';
import { UpdatesProvider } from './pwa/updates';
import { useOfflineReady } from './pwa/useOfflineReady';
import { useRoute } from './router';
import { HomeScreen } from './screens/HomeScreen';
import { PlaceScreen } from './screens/PlaceScreen';
import { RulesScreen } from './screens/RulesScreen';
import { ScanScreen } from './screens/ScanScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { useApplyTheme, useLang } from './settings/preferences';

// With the Supabase library, only when someone opens Husstand (S-011).
const HouseholdScreen = lazy(() => import('./screens/HouseholdScreen'));

export function App() {
  useApplyTheme();
  const lang = useLang();
  const s = strings[lang];
  const route = useRoute();
  const ready = useOfflineReady();

  useEffect(() => {
    void loadInventory();
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <UpdatesProvider>
      {route.name === 'settings' ? (
        <SettingsScreen lang={lang} s={s} />
      ) : route.name === 'rules' ? (
        <RulesScreen s={s} />
      ) : route.name === 'household' ? (
        <Suspense fallback={null}>
          <HouseholdScreen code={route.code} s={s} />
        </Suspense>
      ) : route.name === 'place' ? (
        <PlaceScreen id={route.id} lang={lang} s={s} />
      ) : route.name === 'scan' ? (
        <ScanScreen placeId={route.placeId} lang={lang} s={s} />
      ) : (
        <HomeScreen lang={lang} s={s} />
      )}
      {route.name === 'scan' ? null : <UpdateBanner s={s} ready={ready} />}
    </UpdatesProvider>
  );
}
