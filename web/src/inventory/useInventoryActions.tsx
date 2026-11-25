// What Hjem and a place's page share (S-024): the floating menu (Tilføj · Scan · Søg), "Hvor lægger
// du ting?", the add sheet, the search sheet, a thing's sheet and the messages. A page calls it,
// opens things with `openThing`, and renders `element` once.
//
// Scan and Tilføj ask where things are going, unless the page is a place's own (that place is used)
// or there is only one place. The choice is preset in what follows and remembered for next time.

import { useState, type ReactNode } from 'react';
import { BottomNav } from '../components/BottomNav';
import { useToast } from '../components/toast';
import type { Lang, Strings } from '../i18n/strings';
import { hrefs } from '../router';
import { AddSheet } from './AddSheet';
import { ItemSheet } from './ItemSheet';
import { rememberPlace, useOrderedPlaces } from './orderedPlaces';
import { SearchSheet } from './SearchSheet';
import { WhereSheet } from './WhereSheet';

type Asking = 'add' | 'scan' | null;

export function useInventoryActions({ placeId, lang, s }: { placeId: string | null; lang: Lang; s: Strings }): { openThing: (id: string) => void; element: ReactNode } {
  const places = useOrderedPlaces(s);
  const { show, toast } = useToast();
  const [openId, setOpenId] = useState<string | null>(null);
  const [asking, setAsking] = useState<Asking>(null);
  const [adding, setAdding] = useState<{ placeId: string | null } | null>(null);
  const [addKey, setAddKey] = useState(0);
  const [searching, setSearching] = useState(false);

  const known = placeId ?? (places.length === 1 ? (places[0]?.id ?? null) : null);
  const add = (target: string | null) => {
    setAddKey((k) => k + 1); // a fresh form, starting on this place
    setAdding({ placeId: target });
  };
  const scan = (target: string) => {
    location.hash = hrefs.scan(target);
  };
  const pick = (target: string) => {
    const what = asking;
    setAsking(null);
    rememberPlace(target);
    if (what === 'add') add(target);
    else if (what === 'scan') scan(target);
  };

  const element = (
    <>
      <BottomNav
        label={s.nav.label}
        addLabel={s.add}
        scanLabel={s.scan}
        searchLabel={s.nav.search}
        onAdd={() => (known ? add(known) : setAsking('add'))}
        onScan={() => (known ? scan(known) : setAsking('scan'))}
        onSearch={() => setSearching(true)}
        searchOpen={searching}
      />
      <WhereSheet open={asking !== null} onPick={pick} onClose={() => setAsking(null)} s={s} />
      <AddSheet key={addKey} open={adding !== null} placeId={adding?.placeId ?? known} onClose={() => setAdding(null)} lang={lang} s={s} />
      <SearchSheet open={searching} onClose={() => setSearching(false)} onOpenThing={setOpenId} lang={lang} s={s} />
      <ItemSheet openId={openId} onClose={() => setOpenId(null)} onMessage={show} lang={lang} s={s} />
      {toast}
    </>
  );
  return { openThing: setOpenId, element };
}
