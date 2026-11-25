// The floating menu (S-024), in the look of the owner's Shelfwise (src/ui/primitives/BottomNav):
// an inset dark-green bar of connected "gooey" blobs, joined by an SVG filter, with icon-only
// buttons: Tilføj on the left, Scan in the larger centre circle, Søg on the right. They are
// actions, not tabs; Søg shows the white disc while its sheet is open. No animation library: the
// disc fades with CSS, not at all with reduced motion.

import { Plus, ScanBarcode, Search, type LucideIcon } from 'lucide-react';

const GOO_ID = 'spisekammer-goo';

// Blur plus an alpha threshold: shapes close to each other merge into connected blobs.
function GooFilter() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <filter id={GOO_ID}>
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 22 -10" />
      </filter>
    </svg>
  );
}

const SIDE = 'size-[54px]';
const CENTRE = 'size-[66px]';

function NavButton({ label, Icon, onClick, centre = false, active = false, expanded }: { label: string; Icon: LucideIcon; onClick: () => void; centre?: boolean; active?: boolean; expanded?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-haspopup="dialog"
      aria-expanded={expanded}
      className={`relative grid shrink-0 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${centre ? CENTRE : SIDE} ${active ? 'text-primary' : 'text-on-primary'}`}
    >
      <span aria-hidden="true" className={`absolute rounded-full bg-surface transition-opacity duration-200 motion-reduce:transition-none ${centre ? 'inset-[7px]' : 'inset-[6px]'} ${active ? 'opacity-100' : 'opacity-0'}`} />
      <Icon aria-hidden="true" className={`relative ${centre ? 'size-6' : 'size-[22px]'}`} strokeWidth={1.8} />
    </button>
  );
}

export function BottomNav({ label, addLabel, scanLabel, searchLabel, onAdd, onScan, onSearch, searchOpen }: { label: string; addLabel: string; scanLabel: string; searchLabel: string; onAdd: () => void; onScan: () => void; onSearch: () => void; searchOpen: boolean }) {
  return (
    <nav aria-label={label} className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+12px)] z-20 flex justify-center">
      <GooFilter />
      <div className="pointer-events-auto relative flex items-center gap-[12px] [filter:drop-shadow(0_8px_18px_rgb(16_43_36/0.28))]">
        {/* The shapes the filter merges; the buttons sit above them, unfiltered. */}
        <div aria-hidden="true" className="absolute inset-0 flex items-center gap-[12px]" style={{ filter: `url(#${GOO_ID})` }}>
          <span className="absolute inset-x-[27px] top-1/2 h-5 -translate-y-1/2 bg-primary" />
          <span className={`${SIDE} shrink-0 rounded-full bg-primary`} />
          <span className={`${CENTRE} shrink-0 rounded-full bg-primary`} />
          <span className={`${SIDE} shrink-0 rounded-full bg-primary`} />
        </div>
        <NavButton label={addLabel} Icon={Plus} onClick={onAdd} />
        <NavButton label={scanLabel} Icon={ScanBarcode} onClick={onScan} centre />
        <NavButton label={searchLabel} Icon={Search} onClick={onSearch} active={searchOpen} expanded={searchOpen} />
      </div>
    </nav>
  );
}
