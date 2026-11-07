// The app shell: language and appearance, the update banner, and the screen for the route.

import { UpdateBanner } from './pwa/UpdateBanner';
import { UpdatesProvider } from './pwa/updates';
import { useRoute } from './router';
import { HomeScreen } from './screens/HomeScreen';
import { PlaceScreen } from './screens/PlaceScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { strings } from './i18n/strings';
import { useApplyTheme, useLang } from './settings/preferences';
import { useOfflineReady } from './pwa/useOfflineReady';

export function App() {
  useApplyTheme();
  const lang = useLang();
  const s = strings[lang];
  const route = useRoute();
  const ready = useOfflineReady();
  document.documentElement.lang = lang;

  return (
    <UpdatesProvider>
      {route.name === 'settings' ? (
        <SettingsScreen lang={lang} s={s} />
      ) : route.name === 'place' ? (
        <PlaceScreen id={route.id} s={s} />
      ) : (
        <HomeScreen s={s} />
      )}
      <UpdateBanner s={s} ready={ready} />
    </UpdatesProvider>
  );
}
