// Hash-based routes: work offline and on any static host without server rewrites (from stead).
import { useEffect, useState } from 'react';

export type Route = { name: 'home' } | { name: 'place'; id: string } | { name: 'scan'; placeId: string | null } | { name: 'settings' } | { name: 'rules' } | { name: 'places' } | { name: 'household'; code: string | null };

export const hrefs = {
  home: '#/',
  place: (id: string) => `#/place/${encodeURIComponent(id)}`,
  scan: (placeId?: string) => (placeId ? `#/scan/${encodeURIComponent(placeId)}` : '#/scan'),
  settings: '#/settings',
  rules: '#/rules',
  places: '#/places',
  household: '#/household',
  join: (code: string) => `#/join/${encodeURIComponent(code)}`,
};

export function parseRoute(hash: string): Route {
  const place = /^#\/place\/([^/]+)$/.exec(hash);
  if (place?.[1]) return { name: 'place', id: decodeURIComponent(place[1]) };
  const scan = /^#\/scan(?:\/([^/]+))?$/.exec(hash);
  if (scan) return { name: 'scan', placeId: scan[1] ? decodeURIComponent(scan[1]) : null };
  if (hash === '#/settings') return { name: 'settings' };
  if (hash === '#/rules') return { name: 'rules' };
  if (hash === '#/places') return { name: 'places' };
  if (hash === '#/household') return { name: 'household', code: null };
  const join = /^#\/join\/([^/]+)$/.exec(hash);
  if (join?.[1]) return { name: 'household', code: decodeURIComponent(join[1]) };
  return { name: 'home' };
}

// The pages visited in this session, so "back" can tell whether there is an in-app page to
// return to. Opened directly on a deep link, "back" goes to the parent page instead of leaving.
const visited: string[] = [(typeof location === 'undefined' ? '' : location.hash) || hrefs.home];

function track(hash: string) {
  const last = visited[visited.length - 1] ?? '';
  if (visited.length > 1 && visited[visited.length - 2] === hash) visited.pop();
  else if (last !== hash) visited.push(hash);
}

export function goBack(fallback: string) {
  if (visited.length > 1) history.back();
  else {
    visited[0] = fallback;
    location.replace(fallback);
  }
}

export function useRoute(): Route {
  const [start] = useState(() => location.hash);
  const [route, setRoute] = useState(() => parseRoute(start));
  useEffect(() => {
    const update = () => {
      track(location.hash || hrefs.home);
      setRoute(parseRoute(location.hash));
    };
    window.addEventListener('hashchange', update);
    if (location.hash !== start) update();
    return () => window.removeEventListener('hashchange', update);
  }, [start]);
  return route;
}
