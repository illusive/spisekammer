// Choosing a place (S-022): buttons side by side while there are three places or fewer, a dropdown
// above that. Used when adding, in "Flyt til" and when a place with things is deleted.

import { useId } from 'react';
import { Choice, selectClass } from '../components/ui';
import type { Strings } from '../i18n/strings';
import { placeName, type Place } from '../places';
import { useInventory } from './store';

export const BUTTONS_UP_TO = 3;

export function PlaceField({ name, legend, value, onChange, places, s }: { name: string; legend: string; value: string; onChange: (placeId: string) => void; places: Place[]; s: Strings }) {
  const all = useInventory().places;
  const id = useId();
  const options = places.map((p) => ({ value: p.id, label: placeName(all, p.id, s) }));
  if (options.length <= BUTTONS_UP_TO) return <Choice name={name} legend={legend} value={value} onChange={onChange} options={options} />;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="mb-1 font-semibold">
        {legend}
      </label>
      <select id={id} name={name} value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
