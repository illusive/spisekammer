// "Works offline" means a service worker controls the page, so the app and its files load without a
// network. (Stead also waits for its content pack; Spisekammer has none yet.)

import { useEffect, useState } from 'react';

export function useOfflineReady(): boolean {
  const [controlled, setControlled] = useState(() => Boolean(navigator.serviceWorker?.controller));
  useEffect(() => {
    const sw = navigator.serviceWorker;
    if (!sw) return;
    const update = () => setControlled(Boolean(sw.controller));
    sw.addEventListener('controllerchange', update);
    void sw.ready.then(update);
    return () => sw.removeEventListener('controllerchange', update);
  }, []);
  return controlled;
}
