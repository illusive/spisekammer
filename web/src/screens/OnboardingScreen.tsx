// The first start (S-015), one thing at a time, after bikeplanner's setup wizard: a welcome, the
// places you have, whether to share, and a short "ready". Shown once, on a phone with nothing in it;
// "Spring over" keeps the default places. Everything chosen here can be changed in Indstillinger.

import { Check, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button, Choice, fieldClass } from '../components/ui';
import type { Strings } from '../i18n/strings';
import { PLACE_ICON } from '../inventory/placeIcons';
import { inventory, useInventory } from '../inventory/store';
import { usePageTitle } from '../lib/usePageTitle';
import { PLACE_KINDS, placeName, placeOf, PRESET_IDS, type PlaceKind, type PresetId } from '../places';
import { hrefs } from '../router';
import { setPreference } from '../settings/preferences';

const PRESET_KIND: Record<PresetId, PlaceKind> = { freezer: 'freezer', pantry: 'pantry', larder: 'pantry', fridge: 'fridge' };
const STEPS = 2; // the numbered steps between the welcome and "ready"

export function OnboardingScreen({ s }: { s: Strings }) {
  const t = s.onboarding;
  usePageTitle('', s.appTitle);
  const { items, places } = useInventory();
  const [step, setStep] = useState(0); // 0 welcome, 1 places, 2 share, 3 ready
  const [chosen, setChosen] = useState<Set<string>>(() => new Set(places.map((p) => p.id)));
  const [ownName, setOwnName] = useState('');
  const [ownKind, setOwnKind] = useState<PlaceKind>('freezer');
  const [share, setShare] = useState<'yes' | 'no'>('no');

  const own = places.filter((p) => !(PRESET_IDS as readonly string[]).includes(p.id));
  const rows: { id: string; name: string; kind: PlaceKind }[] = [
    ...PRESET_IDS.map((id) => ({ id, name: s.placePresets[id], kind: placeOf(places, id)?.kind ?? PRESET_KIND[id] })),
    ...own.map((p) => ({ id: p.id, name: placeName(places, p.id, s), kind: p.kind })),
  ];

  const toggle = (id: string) =>
    setChosen((now) => {
      const next = new Set(now);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const addOwn = () => {
    if (!ownName.trim()) return;
    const id = inventory.addPlace(ownName, ownKind);
    setChosen((now) => new Set(now).add(id));
    setOwnName('');
  };

  // The ticked places become the household's places: missing presets are added, unticked empty
  // places are removed (a place with things in it stays).
  const applyPlaces = () => {
    for (const id of PRESET_IDS) if (chosen.has(id) && !placeOf(inventory.get().places, id)) inventory.addPlace('', PRESET_KIND[id], id);
    for (const p of [...inventory.get().places]) {
      if (!chosen.has(p.id) && !items.some((i) => i.placeId === p.id)) inventory.removePlace(p.id, null);
    }
  };

  const finish = () => {
    setPreference('onboarded', true);
    if (share === 'yes') location.hash = hrefs.household;
  };

  const progress = step === 0 ? 0 : ((step - 1) / STEPS) * 100;
  const canNext = step !== 1 || chosen.size > 0;

  return (
    <div className="flex min-h-dvh flex-col bg-background text-text">
      {step > 0 ? (
        <div className="h-1 bg-surface" aria-hidden="true">
          <div className="h-full bg-accent transition-[width]" style={{ width: `${progress}%` }} />
        </div>
      ) : null}

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-[20px] pt-[max(2rem,env(safe-area-inset-top))] pb-8">
        {step === 0 ? (
          <div className="flex flex-col gap-5">
            <p className="text-lg font-bold text-accent">{t.brand}</p>
            <h1 className="text-[min(2.5rem,11vw)] leading-tight font-bold tracking-tight">{t.title}</h1>
            <p className="text-lg">{t.intro}</p>
            <Button variant="primary" onClick={() => setStep(1)} className="mt-2">
              {t.start}
            </Button>
            <button type="button" onClick={finish} className="min-h-11 self-center text-sm font-bold underline underline-offset-4">
              {t.skip}
            </button>
          </div>
        ) : step === 1 ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm font-bold text-muted">{t.step(1, STEPS)}</p>
            <h1 className="text-2xl font-bold">{t.placesTitle}</h1>
            <p>{t.placesIntro}</p>
            <ul className="flex flex-col divide-y divide-border rounded-card bg-surface">
              {rows.map((row) => {
                const Icon = PLACE_ICON[row.kind];
                const on = chosen.has(row.id);
                return (
                  <li key={row.id}>
                    <label className="flex min-h-16 cursor-pointer items-center gap-[14px] px-[18px] py-3">
                      <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-soft text-on-soft">
                        <Icon className="size-6" strokeWidth={1.75} />
                      </span>
                      <span className="flex-1">
                        <span className="block font-bold">{row.name}</span>
                        <span className="block text-sm text-muted">{s.placeKinds[row.kind]}</span>
                      </span>
                      <input type="checkbox" checked={on} onChange={() => toggle(row.id)} className="peer sr-only" />
                      <span aria-hidden="true" className={`grid size-7 place-items-center rounded-full border-2 peer-focus-visible:outline-2 peer-focus-visible:outline-text ${on ? 'border-accent bg-accent text-on-accent' : 'border-border'}`}>
                        {on ? <Check className="size-4" strokeWidth={3} /> : null}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addOwn();
              }}
              className="flex flex-col gap-3 rounded-card bg-surface px-[18px] py-4"
            >
              <label className="flex flex-col gap-1">
                <span className="font-bold">{t.ownPlace}</span>
                <input value={ownName} onChange={(e) => setOwnName(e.target.value)} maxLength={40} placeholder={s.placesScreen.namePlaceholder} autoComplete="off" className={fieldClass} />
              </label>
              <Choice<PlaceKind> name="own-kind" legend={s.placesScreen.kind} value={ownKind} onChange={setOwnKind} options={PLACE_KINDS.map((k) => ({ value: k, label: s.placeKinds[k] }))} />
              <Button type="submit" disabled={!ownName.trim()}>
                <Plus aria-hidden="true" className="size-5" />
                {t.ownPlaceAdd}
              </Button>
            </form>
            {chosen.size === 0 ? (
              <p role="alert" className="text-sm font-bold text-danger">
                {t.placesNone}
              </p>
            ) : null}
          </div>
        ) : step === 2 ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm font-bold text-muted">{t.step(2, STEPS)}</p>
            <h1 className="text-2xl font-bold">{t.shareTitle}</h1>
            <p>{t.shareIntro}</p>
            <fieldset className="flex flex-col gap-3">
              <legend className="sr-only">{t.shareTitle}</legend>
              {(['yes', 'no'] as const).map((v) => (
                <label key={v} className={`flex cursor-pointer flex-col gap-1 rounded-card border-2 px-[18px] py-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-text ${share === v ? 'border-accent bg-surface' : 'border-transparent bg-surface'}`}>
                  <input type="radio" name="share" value={v} checked={share === v} onChange={() => setShare(v)} className="sr-only" />
                  <span className="font-bold">{v === 'yes' ? t.shareYes : t.shareNo}</span>
                  <span className="text-sm text-muted">{v === 'yes' ? t.shareYesHint : t.shareNoHint}</span>
                </label>
              ))}
            </fieldset>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <span aria-hidden="true" className="grid size-14 place-items-center rounded-full bg-accent text-on-accent">
              <Check className="size-8" strokeWidth={3} />
            </span>
            <h1 className="text-2xl font-bold">{t.doneTitle}</h1>
            <ul className="flex list-disc flex-col gap-2 pl-[20px]">
              {t.donePoints.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            {share === 'yes' ? <p className="font-bold">{t.doneShare}</p> : null}
          </div>
        )}
      </main>

      {step > 0 ? (
        <nav className="sticky bottom-0 flex items-center justify-between gap-[12px] border-t border-border bg-background px-[20px] pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {step < 3 ? (
            <button type="button" onClick={finish} className="min-h-11 text-sm font-bold underline underline-offset-4">
              {t.skip}
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-[8px]">
            {step > 1 ? <Button onClick={() => setStep(step - 1)}>{t.back}</Button> : null}
            {step < 3 ? (
              <Button
                variant="primary"
                disabled={!canNext}
                onClick={() => {
                  if (step === 1) applyPlaces();
                  setStep(step + 1);
                }}
              >
                {t.next}
              </Button>
            ) : (
              <Button variant="primary" onClick={finish}>
                {t.finish}
              </Button>
            )}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
