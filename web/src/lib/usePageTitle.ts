// The browser and app-switcher title of each page: "Page – stead", or just "stead" for Home ('').
// With a heading, focus moves to it once the page has its title, so screen readers announce the new
// page (used where a page loads its content). Null: not loaded yet, nothing changes.

import { useEffect, type RefObject } from 'react';

export function usePageTitle(page: string | null, appTitle: string, heading?: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (page === null) return;
    document.title = page ? `${page} – ${appTitle}` : appTitle;
    heading?.current?.focus();
  }, [page, appTitle, heading]);
}
