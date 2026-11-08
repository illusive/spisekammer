// The app shell: language and appearance, the inventory loaded once, the update banner, the first-run
// steps on a new phone (S-015), and the screen for the route.

import { lazy, Suspense, useEffect } from 'react';
import { strings } from './i18n/strings';
import { loadInventory, useInventory, useInventoryLoaded } from './inventory/store';
import { UpdateBanner } from './pwa/UpdateBanner';
import { UpdatesProvider } from './pwa/updates';
import { useOfflineReady } from './pwa/useOfflineReady';
import { useRoute } from './router';
import { HomeScreen } from './screens/HomeScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { PlaceScreen } from './screens/PlaceScreen';
import { PlacesScreen } from './screens/PlacesScreen';
import { RulesScreen } from './screens/RulesScreen';
import { ScanScreen } from './screens/ScanScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { setPreference, useApplyTheme, useLang, usePreferences } from './settings/preferences';

// With the Supabase library, only when someone opens Del (S-011).
const HouseholdScreen = lazy(() => import('./screens/HouseholdScreen'));

export function App() {
  useApplyTheme();
  const lang = useLang();
  const s = strings[lang];
  const route = useRoute();
  const ready = useOfflineReady();
  const loaded = useInventoryLoaded();
  const hasThings = useInventory().items.length > 0;
  const { onboarded } = usePreferences();

  useEffect(() => {
    void loadInventory();
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  // A phone that already has things (from before S-015) needs no first-run steps.
  useEffect(() => {
    if (loaded && !onboarded && hasThings) setPreference('onboarded', true);
  }, [loaded, onboarded, hasThings]);

  // The first-run steps: on Hjem, on a phone with nothing in it yet (an invite link goes straight on).
  if (loaded && !onboarded && !hasThings && route.name === 'home') return <OnboardingScreen s={s} />;

  return (
    <UpdatesProvider>
      {route.name === 'settings' ? (
        <SettingsScreen lang={lang} s={s} />
      ) : route.name === 'places' ? (
        <PlacesScreen s={s} />
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
