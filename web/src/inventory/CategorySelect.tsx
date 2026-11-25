// "Slags": the short list of food groups (S-021), as a plain dropdown.

import { selectClass } from '../components/ui';
import type { Strings } from '../i18n/strings';
import { CATEGORIES, type Category } from './categories';

export function CategorySelect({ id, value, onChange, s }: { id: string; value: Category; onChange: (category: Category) => void; s: Strings }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value as Category)} className={selectClass}>
      {CATEGORIES.map((c) => (
        <option key={c} value={c}>
          {s.categories[c]}
        </option>
      ))}
    </select>
  );
}
