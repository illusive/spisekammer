// Download progress of the service worker's install (sw.ts posts PRECACHE_PROGRESS messages).

import { useEffect, useState } from 'react';

export interface PrecacheProgress {
  done: number;
  total: number;
  failed?: true; // the download stopped (sw.ts); a new attempt reports progress again
}

export function usePrecacheProgress(): PrecacheProgress | null {
  const [progress, setProgress] = useState<PrecacheProgress | null>(null);
  useEffect(() => {
    const sw = navigator.serviceWorker;
    if (!sw) return;
    const onMessage = (event: MessageEvent<{ type?: string; done?: number; total?: number }>) => {
      const { type, done, total } = event.data ?? {};
      if (type === 'PRECACHE_PROGRESS' && typeof done === 'number' && typeof total === 'number') setProgress({ done, total });
      if (type === 'PRECACHE_FAILED') setProgress((p) => ({ done: p?.done ?? 0, total: p?.total ?? 0, failed: true }));
    };
    sw.addEventListener('message', onMessage);
    return () => sw.removeEventListener('message', onMessage);
  }, []);
  return progress;
}
