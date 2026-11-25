// A number with − and + buttons (48 px each), e.g. how many of a thing. The number is a field too
// (D-054): tap it and type. A typed number is used as soon as it is a valid one within min..max;
// leaving the field shows the value in use again.

import { useId, useState } from 'react';
import { parseCounter } from '../i18n/format';

const stepButton = 'grid size-12 place-items-center rounded-full border border-border bg-surface text-xl text-primary disabled:opacity-40';

export function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  const [text, setText] = useState<string | null>(null); // what is typed, while the field has focus
  const id = useId();
  const step = (by: number) => {
    setText(null);
    onChange(Math.min(max, Math.max(min, value + by)));
  };
  return (
    <div className="flex items-center justify-between gap-[12px]">
      <span className="font-semibold" id={id}>
        {label}
      </span>
      <span className="flex items-center gap-[4px]" role="group" aria-labelledby={id}>
        <button type="button" onClick={() => step(-1)} disabled={value <= min} aria-label={`${label} −1`} className={stepButton}>
          −
        </button>
        <input
          value={text ?? String(value)}
          onChange={(e) => {
            setText(e.target.value);
            const n = parseCounter(e.target.value, min, max);
            if (n !== null && n !== value) onChange(n);
          }}
          onFocus={(e) => e.target.select()}
          onBlur={() => setText(null)}
          aria-label={label}
          inputMode="numeric"
          autoComplete="off"
          enterKeyHint="done"
          className="h-12 w-16 rounded-field border border-border bg-surface text-center font-mono text-lg tabular-nums"
        />
        <button type="button" onClick={() => step(1)} disabled={value >= max} aria-label={`${label} +1`} className={stepButton}>
          +
        </button>
      </span>
    </div>
  );
}
