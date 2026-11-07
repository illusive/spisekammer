// One place (Køleskab, Fryser, Skab): its things grouped by category. Empty until slice 2.

import { MessageState, Page, SubPageHeader } from '../components/ui';
import type { Strings } from '../i18n/strings';
import { usePageTitle } from '../lib/usePageTitle';
import { DEFAULT_PLACES } from '../places';
import { hrefs } from '../router';

export function PlaceScreen({ id, s }: { id: string; s: Strings }) {
  const place = DEFAULT_PLACES.find((p) => p.id === id);
  const title = place ? s.placeKinds[place.kind] : s.places;
  usePageTitle(title, s.appTitle);
  return (
    <Page>
      <SubPageHeader backLabel={s.back} backTo={hrefs.home} title={title} subtitle={s.itemCount(0)} />
      <MessageState title={s.emptyPlace} body={s.comingSoon} />
    </Page>
  );
}
