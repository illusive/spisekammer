// App updates (D-065): registers the service worker once and shares its state with the banner. The
// browser looks for a new sw.js on every launch; a new version downloads in full before it can be
// used (sw.ts).

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface Updates {
  offlineReady: boolean;
  needRefresh: boolean;
  dismiss: () => void;
  applyUpdate: () => void;
}

const UpdatesContext = createContext<Updates | null>(null);

let reloading = false;
function reloadOnce() {
  if (reloading) return;
  reloading = true;
  window.location.reload();
}

export function UpdatesProvider({ children }: { children: ReactNode }) {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const value = useMemo<Updates>(
    () => ({
      offlineReady,
      needRefresh,
      dismiss: () => {
        setOfflineReady(false);
        setNeedRefresh(false);
      },
      // The plugin reloads only for updates its own Workbox saw. One found by the browser while the
      // app was open counts as external, so reload here when the new
      // version takes over (once).
      applyUpdate: () => {
        navigator.serviceWorker?.addEventListener('controllerchange', reloadOnce, { once: true });
        void updateServiceWorker(true);
      },
    }),
    [offlineReady, needRefresh, setOfflineReady, setNeedRefresh, updateServiceWorker],
  );
  return <UpdatesContext.Provider value={value}>{children}</UpdatesContext.Provider>;
}

export function useUpdates(): Updates {
  const updates = useContext(UpdatesContext);
  if (!updates) throw new Error('useUpdates outside UpdatesProvider');
  return updates;
}
