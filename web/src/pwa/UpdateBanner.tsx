// Shows the service worker's state: "works offline now" once, and "new version ready" when an
// update has fully downloaded (it never takes over by itself). The state is shared (updates.tsx).

import { useEffect } from 'react';
import type { Strings } from '../i18n/strings';
import { useUpdates } from './updates';

// `ready`: the pack is open as well as the files stored (useOfflineReady), so "klar uden internet" is true (D-071).
export function UpdateBanner({ s, ready }: { s: Strings; ready: boolean }) {
  const { offlineReady: stored, needRefresh, dismiss, applyUpdate } = useUpdates();
  const offlineReady = stored && ready;

  // "Works offline now" is informational: hide it after a few seconds. "Update" stays until acted on.
  useEffect(() => {
    if (!offlineReady || needRefresh) return;
    const timer = setTimeout(dismiss, 6000);
    return () => clearTimeout(timer);
  }, [offlineReady, needRefresh, dismiss]);

  if (!offlineReady && !needRefresh) return null;

  return (
    <>
      {/* Spacer so the end of the page can scroll clear of the fixed banner. */}
      <div aria-hidden="true" className="h-24" />
      <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+6.25rem)] z-10 px-[18px]" role="status">
        <div className="mx-auto flex max-w-md items-center gap-3 rounded-card border border-line-soft bg-surface p-3 shadow-float">
          <p className="flex-1">{needRefresh ? s.updateReady : s.offlineReady}</p>
          {needRefresh ? (
            <button type="button" onClick={applyUpdate} className="min-h-11 rounded-field bg-primary px-4 font-semibold text-on-primary">
              {s.updateAction}
            </button>
          ) : null}
          <button type="button" onClick={dismiss} className="min-h-11 min-w-11 px-2 font-semibold">
            {s.dismiss}
          </button>
        </div>
      </div>
    </>
  );
}
