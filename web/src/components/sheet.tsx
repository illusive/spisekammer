// Sheets (D-049, S-016–S-019): the bottom sheet, its header, and the confirm sheet. Split from
// ui.tsx (S-024).

import { X } from 'lucide-react';
import { useCallback, useEffect, useId, useReducer, useRef, useState, type ReactNode } from 'react';
import { keyboardFit } from '../lib/keyboardFit';
import { Button, IconButton } from './ui';

// The handle at the top of a sheet (Shelfwise): only a look; the X closes.
function SheetHandle({ className = '' }: { className?: string }) {
  return <span aria-hidden="true" className={`mx-auto block h-1 w-10 rounded-full bg-border ${className}`} />;
}

let openSheets = 0; // sheets open now, for the page-scroll lock (S-019)

// A sheet from the bottom of the screen (D-049): a native modal <dialog>, so focus stays inside,
// the page behind is inert, Escape closes it and focus goes back to what opened it. A tap on the
// dimmed page above it closes it too, unless `dismissOnBackdrop` is false (a sheet with fields, where
// a stray tap would lose what was entered). It sits above the tab bar (the top layer). On opening,
// focus goes to the element marked `data-autofocus`, if any, rather than to the first field, whose
// keyboard would cover a sheet that is already filled in (D-053).
// It slides up when opened and back down when closed (D-054, index.css). While it slides down it
// keeps showing what it showed, even if the parent has already let go of it (a deleted thing); the
// content is dropped once it is closed, so the next opening starts afresh.
// The keyboard (S-016, S-017): only the content scrolls, under a header that stays (SheetHeader).
// When a keyboard covers the bottom, the sheet is lifted above it (lib/keyboardFit.ts); without one
// nothing about its place is changed. The page behind does not scroll.
// Focus starts on [data-autofocus] (the name when adding by typing) or else on the title, so no
// keyboard opens by itself anywhere else.
export function Sheet({ open, onClose, labelledBy, dismissOnBackdrop = true, children }: { open: boolean; onClose: () => void; labelledBy: string; dismissOnBackdrop?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const last = useRef<ReactNode>(null);
  if (open) last.current = children;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      delete dialog.dataset.closing;
      if (!dialog.open) {
        dialog.showModal();
        (dialog.querySelector<HTMLElement>('[data-autofocus]') ?? dialog.querySelector<HTMLElement>('h2[tabindex]'))?.focus({ preventScroll: true });
      }
      return;
    }
    if (!dialog.open) return;
    const finish = () => {
      delete dialog.dataset.closing;
      dialog.close();
      last.current = null;
      rerender();
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }
    dialog.dataset.closing = '';
    const onEnd = (e: AnimationEvent) => {
      if (e.target === dialog) finish();
    };
    dialog.addEventListener('animationend', onEnd);
    const timer = window.setTimeout(finish, 400); // in case the animation does not run
    return () => {
      dialog.removeEventListener('animationend', onEnd);
      window.clearTimeout(timer);
    };
  }, [open]);

  // Fitted above the keyboard (lib/keyboardFit.ts): without a keyboard nothing is changed. While
  // any sheet is open the page behind does not scroll; counted, not looked up in the page, because
  // a closing sheet is still [open] when this cleans up (S-019: the lookup kept the page locked).
  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    const root = document.documentElement;
    openSheets += 1;
    root.classList.add('sheet-open');
    const vv = window.visualViewport;
    const body = dialog.firstElementChild as HTMLElement | null; // the part that scrolls
    const fit = () => {
      if (!vv) return;
      const place = keyboardFit({ layoutHeight: root.clientHeight, visibleTop: vv.offsetTop, visibleHeight: vv.height });
      dialog.style.bottom = place ? `${place.lift}px` : '';
      if (body) body.style.maxHeight = place ? `${place.maxHeight}px` : '';
    };
    fit();
    vv?.addEventListener('resize', fit);
    vv?.addEventListener('scroll', fit);
    return () => {
      vv?.removeEventListener('resize', fit);
      vv?.removeEventListener('scroll', fit);
      dialog.style.bottom = '';
      if (body) body.style.maxHeight = '';
      openSheets = Math.max(0, openSheets - 1);
      if (openSheets === 0) root.classList.remove('sheet-open');
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault(); // Escape: slide down like any other closing
        onClose();
      }}
      onClick={(e) => {
        if (dismissOnBackdrop && e.target === e.currentTarget) onClose(); // the backdrop, not the content
      }}
      className="sheet inset-x-0 top-auto bottom-0 m-0 mx-auto max-h-none w-full max-w-xl overflow-hidden rounded-t-sheet bg-background p-0 text-text shadow-sheet backdrop:bg-overlay"
    >
      {/* The sheet is a plain box; this part has its own height limit and scrolls (S-018: no flex,
          no "open" selector, so older Safari lays it out the same). */}
      <div className="sheet-body scroll-pt-24 overflow-y-auto overscroll-contain px-[18px] pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">{open ? children : last.current}</div>
    </dialog>
  );
}

// The top of a sheet (D-070): its title, and the one way to close it, an X at the top right. Lines
// under the title go in `children`. It stays at the top while the sheet scrolls (S-015), so closing
// is always one tap away. `autofocus`: focus starts on the title (a sheet that is already filled
// in, D-053), not on a field whose keyboard would cover it.
export function SheetHeader({ id, title, closeLabel, onClose, autofocus = false, children }: { id: string; title: ReactNode; closeLabel: string; onClose: () => void; autofocus?: boolean; children?: ReactNode }) {
  return (
    <div className="sticky -top-4 z-10 -mx-[18px] -mt-4 border-b border-line-soft bg-background px-[18px] pt-2 pb-3">
      <SheetHandle className="mb-2" />
      <div className="flex items-start justify-between gap-[12px]">
        <div className="min-w-0 pt-2">
          <h2 id={id} tabIndex={-1} data-autofocus={autofocus ? '' : undefined} className="text-lg font-bold break-words outline-none">
            {title}
          </h2>
          {children}
        </div>
        <IconButton label={closeLabel} Icon={X} onClick={onClose} className="-mr-1" />
      </div>
    </div>
  );
}

// Asking before something that cannot be undone (D-070): one sheet everywhere, instead of the
// browser's confirm box. `confirm(...)` resolves true when the user agrees; render `sheet` once in
// the component. Deleting has the red button (D-054); focus starts on the way out ("Annuller").
export interface ConfirmOptions {
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
}

export function useConfirm(): { confirm: (options: ConfirmOptions) => Promise<boolean>; sheet: ReactNode } {
  const [pending, setPending] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);
  const id = useId();
  const confirm = useCallback((options: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ ...options, resolve })), []);
  const answer = (ok: boolean) => {
    pending?.resolve(ok);
    setPending(null);
  };
  const sheet = (
    <Sheet open={pending !== null} onClose={() => answer(false)} labelledBy={id}>
      {pending ? (
        <div className="flex flex-col gap-4">
          <SheetHandle className="-mt-2" />
          <div>
            <h2 id={id} className="text-lg font-bold">
              {pending.title}
            </h2>
            {pending.body ? <p className="mt-1 text-muted">{pending.body}</p> : null}
          </div>
          <div className="flex flex-col gap-[8px]">
            <Button variant={pending.danger ? 'danger' : 'primary'} onClick={() => answer(true)}>
              {pending.confirmLabel}
            </Button>
            <Button variant="secondary" onClick={() => answer(false)} data-autofocus="">
              {pending.cancelLabel}
            </Button>
          </div>
        </div>
      ) : null}
    </Sheet>
  );
  return { confirm, sheet };
}
