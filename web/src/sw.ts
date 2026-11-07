/// <reference lib="webworker" />
// Service worker (D-021, D-022). vite-plugin-pwa injects the list of built files into
// self.__WB_MANIFEST; the caching and update behaviour below is our own.
//
// - Install: download every file into a new cache. If any download fails, the install fails
//   and the current version keeps running (never replace a working version with a partial one).
// - A new version waits until the app asks it to take over (the user taps "Update").
// - Fetch: cache first, so the app works fully offline; navigations get the cached index.html.

export {}; // makes this file a module, so the declaration below can narrow `self`

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: { url: string; revision: string | null }[] };

const manifest = self.__WB_MANIFEST;
const PREFIX = 'spisekammer-';

function hash(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

const CACHE = PREFIX + hash(JSON.stringify(manifest));
// De-duplicated: the injected list can name the same file twice (e.g. manifest icons), and
// cache.addAll rejects a batch with duplicate URLs, which would make every install fail.
const urls = [...new Set(manifest.map((entry) => new URL(entry.url, self.registration.scope).href))];
const indexUrl = new URL('index.html', self.registration.scope).href;

// Downloads every file into the new cache, a few at a time, and reports progress to open pages
// (the first install shows it). Files are fetched past the HTTP cache: index.html and the pack keep
// their address between versions, and a stale copy must never be stored next to new code.
// If any file fails, the new cache is deleted and the install fails; the current version stays.
async function precache(): Promise<void> {
  const cache = await caches.open(CACHE);
  let done = 0;
  const report = async () => {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) client.postMessage({ type: 'PRECACHE_PROGRESS', done, total: urls.length });
  };
  try {
    const queue = [...urls];
    const worker = async () => {
      for (let url = queue.shift(); url; url = queue.shift()) {
        const response = await fetch(new Request(url, { cache: 'reload' }));
        if (!response.ok) throw new Error(`Precache failed (${response.status}): ${url}`);
        await cache.put(url, response);
        done++;
        await report();
      }
    };
    await Promise.all([worker(), worker(), worker(), worker()]);
  } catch (error) {
    await caches.delete(CACHE);
    // Open pages say so instead of waiting for ever (D-071); the next launch tries again.
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) client.postMessage({ type: 'PRECACHE_FAILED' });
    throw error;
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  // Range requests (map area downloads, D-036) go straight to the network.
  if (request.headers.has('range')) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      if (request.mode === 'navigate') return (await cache.match(indexUrl)) ?? fetch(request);
      return (await cache.match(request, { ignoreSearch: true })) ?? fetch(request);
    })(),
  );
});
