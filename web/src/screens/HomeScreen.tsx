// Hjem (S-005, S-023, S-024): the wordmark and the gear, "Hvad har du?", "Brug snart" (things whose
// date is near or past, across all places), then the places with how much is in each, and
// "Rediger" to Steder (S-020). Scan, Tilføj and Søg are in the floating menu.

import { Pencil } from 'lucide-react';
import { useRef } from 'react';
import { Bubble, ButtonLink, LinkRow, Page, RowLine, RowList, Section, SettingsButton, Wordmark, pageTitleClass } from '../components/ui';
import { today } from '../i18n/format';
import type { Lang, Strings } from '../i18n/strings';
import { ItemRow } from '../inventory/ItemRow';
import { useOrderedPlaces } from '../inventory/orderedPlaces';
import { PLACE_ICON } from '../inventory/placeIcons';
import { useInventory, useInventoryLoaded } from '../inventory/store';
import { countsByPlace } from '../inventory/summary';
import { useInventoryActions } from '../inventory/useInventoryActions';
import { itemKeeping } from '../keeping/itemKeeping';
import { isUrgent } from '../keeping/rules';
import { usePageTitle } from '../lib/usePageTitle';
import { labelOf, placeName } from '../places';
import { hrefs } from '../router';

export function HomeScreen({ lang, s }: { lang: Lang; s: Strings }) {
  const { items, places: allPlaces } = useInventory();
  const loaded = useInventoryLoaded();
  const places = useOrderedPlaces(s);
  const heading = useRef<HTMLHeadingElement>(null);
  usePageTitle('', s.appTitle, heading);
  const { openThing, element } = useInventoryActions({ placeId: null, lang, s });

  const day = today();
  // Use soon: past, today or within the place's window (rules.urgency), the earliest first.
  const soon = items.filter((item) => isUrgent(itemKeeping(item, day, allPlaces).urgency)).sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  const counts = countsByPlace(items);

  return (
    <Page nav>
      <header className="mb-5 flex items-center justify-between gap-[12px]">
        <Wordmark name={s.appTitle} />
        <SettingsButton label={s.settingsOpen} />
      </header>

      <h1 ref={heading} tabIndex={-1} className={`${pageTitleClass} text-[2.25rem] outline-none`}>
        {s.homeTitle}
      </h1>
      {loaded && items.length === 0 ? <p className="mt-3 text-muted">{s.emptyHome}</p> : null}

      {soon.length > 0 ? (
        <Section id="use-soon" title={s.keep.useSoon} count={soon.length} className="mt-6">
          <RowList>
            {soon.map((item) => (
              <ItemRow key={item.id} item={item} place={placeName(allPlaces, item.placeId, s)} today={day} onOpen={openThing} lang={lang} s={s} />
            ))}
          </RowList>
        </Section>
      ) : null}

      <Section
        id="places"
        title={s.places}
        className="mt-6"
        aside={
          // Steder from Hjem (S-020): add, rename, order or delete places.
          <ButtonLink variant="action" href={hrefs.places} label={s.editPlaces.label} className="-mr-[6px]">
            <Pencil aria-hidden="true" className="size-4" />
            {s.editPlaces.text}
          </ButtonLink>
        }
      >
        <RowList>
          {places.map((place) => (
            <LinkRow
              key={place.id}
              href={hrefs.place(place.id)}
              leading={<Bubble Icon={PLACE_ICON[place.kind]} />}
              title={labelOf(place, s)}
              subtitle={<RowLine mono>{loaded ? s.itemCount(counts.get(place.id) ?? 0) : s.loading}</RowLine>}
            />
          ))}
        </RowList>
      </Section>
      {element}
    </Page>
  );
}
