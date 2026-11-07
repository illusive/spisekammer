// App updates (D-065): registers the service worker once and shares its state with the banner and
// Settings. "Søg efter ny version" asks the browser to fetch the app's own sw.js again, as it does
// by itself on every launch; a new version downloads in full before it can be used (sw.ts).

import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { resultOf, type CheckResult } from './checkResult';

export type { CheckResult };

interface Updates {
  offlineReady: boolean;
  needRefresh: boolean;
  dismiss: () => void;
  applyUpdate: () => void;
  check: () => Promise<CheckResult>;
}

const UpdatesContext = createContext<Updates | null>(null);

let reloading = false;
function reloadOnce() {
  if (reloading) return;
  reloading = true;
  window.location.reload();
}

export function UpdatesProvider({ children }: { children: ReactNode }) {
  const registration = useRef<ServiceWorkerRegistration | null>(null);
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW: (_url, r) => {
      registration.current = r ?? null;
    },
  });

  const check = useCallback(async (): Promise<CheckResult> => {
    if (!navigator.onLine) return 'offline';
    const r = registration.current ?? (await navigator.serviceWorker?.getRegistration()) ?? null;
    if (!r) return 'failed';
    try {
      await r.update();
    } catch {
      return navigator.onLine ? 'failed' : 'offline';
    }
    return resultOf(r);
  }, []);

  const value = useMemo<Updates>(
    () => ({
      offlineReady,
      needRefresh,
      dismiss: () => {
        setOfflineReady(false);
        setNeedRefresh(false);
      },
      // The plugin reloads only for updates its own Workbox saw. One found by "Søg efter ny version"
      // or by the browser while the app was open counts as external, so reload here when the new
      // version takes over (once).
      applyUpdate: () => {
        navigator.serviceWorker?.addEventListener('controllerchange', reloadOnce, { once: true });
        void updateServiceWorker(true);
      },
      check,
    }),
    [offlineReady, needRefresh, setOfflineReady, setNeedRefresh, updateServiceWorker, check],
  );
  return <UpdatesContext.Provider value={value}>{children}</UpdatesContext.Provider>;
}

export function useUpdates(): Updates {
  const updates = useContext(UpdatesContext);
  if (!updates) throw new Error('useUpdates outside UpdatesProvider');
  return updates;
}
