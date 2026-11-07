// Hjem: search across everything on top, "Brug snart", then the places. In this first slice the
// inventory is still empty; adding, scanning and taking out come in slice 2.

import { Archive, ChevronRight, Refrigerator, Snowflake, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Card, Page, SearchField, SettingsButton } from '../components/ui';
import type { Strings } from '../i18n/strings';
import { usePageTitle } from '../lib/usePageTitle';
import { DEFAULT_PLACES, type PlaceKind } from '../places';
import { hrefs } from '../router';

export const PLACE_ICON: Record<PlaceKind, LucideIcon> = { fridge: Refrigerator, freezer: Snowflake, pantry: Archive };

export function HomeScreen({ s }: { s: Strings }) {
  const [query, setQuery] = useState('');
  usePageTitle(null, s.appTitle);

  return (
    <Page>
      <header className="mt-2 mb-4 flex items-center justify-between gap-[12px] px-1">
        <p className="text-xl font-bold tracking-tight">{s.appTitle}</p>
        <SettingsButton label={s.settingsOpen} />
      </header>

      <section className="rounded-hero bg-accent px-[20px] pt-5 pb-6 text-on-accent">
        <h1 className="mb-5 text-[min(2.25rem,10vw)] leading-tight font-bold tracking-tight">{s.homeTitle}</h1>
        <SearchField id="home-search" value={query} onChange={setQuery} placeholder={s.searchPlaceholder} label={s.searchLabel} clearLabel={s.clearSearch} />
      </section>

      <Card aria-labelledby="use-soon" className="mt-4">
        <h2 id="use-soon" className="text-lg font-bold">
          {s.useSoon}
        </h2>
        <p className="mt-1 text-muted">{s.useSoonEmpty}</p>
      </Card>

      <section aria-labelledby="places" className="mt-6 flex flex-col gap-3">
        <h2 id="places" className="px-1 text-lg font-bold">
          {s.places}
        </h2>
        <ul className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-3">
          {DEFAULT_PLACES.map((place) => {
            const Icon = PLACE_ICON[place.kind];
            return (
              <li key={place.id}>
                <a href={hrefs.place(place.id)} className="flex min-h-16 items-center gap-[14px] rounded-card bg-surface px-[18px] py-4 min-[420px]:flex-col min-[420px]:items-start">
                  <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-soft text-on-soft">
                    <Icon className="size-6" strokeWidth={1.75} />
                  </span>
                  <span className="flex-1">
                    <span className="block font-bold">{s.placeKinds[place.kind]}</span>
                    <span className="block text-sm text-muted">{s.itemCount(0)}</span>
                  </span>
                  <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted min-[420px]:hidden" />
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="mt-6 px-1 text-center text-sm text-muted">{s.comingSoon}</p>
    </Page>
  );
}
