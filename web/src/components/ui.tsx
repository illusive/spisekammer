// Shared UI primitives, copied from stead (design brief D-025 there) and kept in step by hand. Colours come from the tokens in index.css. Text and
// vertical spacing are rem-based so they follow the system text size on iOS; horizontal padding is
// in px so large text does not squeeze the content column.

import { ArrowLeft, Check, ChevronRight, Search, Settings, TriangleAlert, X, type LucideIcon } from 'lucide-react';
import { decimalForInput, parseCounter } from '../i18n/format';
import { keyboardFit } from '../lib/keyboardFit';
import type { Lang } from '../i18n/strings';
import { goBack, hrefs } from '../router';
import { useCallback, useEffect, useId, useReducer, useRef, useState, type ButtonHTMLAttributes, type ElementType, type HTMLAttributes, type MouseEvent, type ReactNode, type Ref } from 'react';

// A rounded surface. A <section> unless `as` says otherwise (a form, a div).
export function Card({ children, className = '', as: Tag = 'section', ...rest }: { children: ReactNode; className?: string; as?: ElementType } & HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={`rounded-card bg-surface px-[20px] py-5 ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

// Buttons: one shape, a few looks. `primary` is the page's main action (lime), `ink` a strong
// second action, `secondary` everything else on a card, `onPage` the same on the page background,
// `danger` (red) deletes.
// ButtonLink is a link that looks the same.
type ButtonVariant = 'primary' | 'ink' | 'secondary' | 'onPage' | 'danger';
const BUTTON: Record<ButtonVariant, string> = {
  primary: 'min-h-12 bg-accent px-[24px] font-semibold text-on-accent',
  ink: 'min-h-12 bg-ink px-[24px] font-medium text-on-ink',
  secondary: 'min-h-11 bg-background px-[18px] font-medium',
  onPage: 'min-h-11 bg-surface px-[18px] text-sm font-medium',
  danger: 'min-h-12 bg-danger px-[24px] font-semibold text-on-danger', // deleting (D-054)
};
export const buttonClass = (variant: ButtonVariant = 'secondary', className = '') =>
  `flex items-center justify-center gap-[8px] rounded-full text-center disabled:opacity-40 ${BUTTON[variant]} ${className}`;

export function Button({ variant = 'secondary', className, type = 'button', ...rest }: { variant?: ButtonVariant } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={buttonClass(variant, className)} {...rest} />;
}

export function ButtonLink({ variant = 'secondary', className, href, children }: { variant?: ButtonVariant; className?: string; href: string; children: ReactNode }) {
  return (
    <a href={href} className={buttonClass(variant, className)}>
      {children}
    </a>
  );
}

// A round 44 pt button with only an icon; the label is for screen readers.
export function IconButton({ label, Icon, onClick, className = 'bg-surface', ...rest }: { label: string; Icon: LucideIcon; onClick: () => void; className?: string } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className={`grid size-11 shrink-0 place-items-center rounded-full ${className}`} {...rest}>
      <Icon aria-hidden="true" className="size-5" />
    </button>
  );
}

// Every single-line field looks the same (S-015): one height, border, radius and text size. A
// select gets its own arrow (index.css, .select-field), so it lines up with the text fields; a date
// field keeps its native picker inside the same box.
export const fieldClass = 'block h-12 w-full min-w-0 appearance-none rounded-xl border border-border bg-background px-[12px] text-lg text-text';
export const selectClass = `${fieldClass} select-field pr-[40px]`;

// A list of links on one surface, and its rows: title, optional line under it, a chevron.
export function RowList({ children, ordered = false, lang }: { children: ReactNode; ordered?: boolean; lang?: string }) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag className="flex flex-col divide-y divide-border rounded-card bg-surface" lang={lang}>
      {children}
    </Tag>
  );
}

export function LinkRow({ href, title, subtitle, leading, label }: { href: string; title: ReactNode; subtitle?: ReactNode; leading?: ReactNode; label?: string }) {
  return (
    <li>
      <a href={href} aria-label={label} className="flex min-h-14 items-center gap-[12px] px-[20px] py-3">
        {leading}
        <span className="flex-1">
          <span className="block font-medium">{title}</span>
          {subtitle}
        </span>
        <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" />
      </a>
    </li>
  );
}

// A titled part of a page (one heading size everywhere).
export function Section({ id, title, aside, children, className = '' }: { id: string; title: ReactNode; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section aria-labelledby={id} className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-baseline justify-between gap-[12px] px-1">
        <h2 id={id} className="text-xl font-semibold">
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

// The top of a page below a tab: back, an optional action on the right, the title and a line
// under it. `headingRef` lets a page move focus to its title once it has loaded.
// `lang`: the language of the title and lines, when it is not the app's (a Danish guide in the
// English app).
export function SubPageHeader(props: { backLabel: string; backTo: string; title: ReactNode; subtitle?: ReactNode; action?: ReactNode; headingRef?: Ref<HTMLHeadingElement>; lang?: string; children?: ReactNode }) {
  const { backLabel, backTo, title, subtitle, action, headingRef, lang, children } = props;
  return (
    <>
      <div className="flex items-center justify-between gap-[12px]">
        <BackButton label={backLabel} onClick={() => goBack(backTo)} />
        {action}
      </div>
      <header className="mt-4 mb-4 px-1" lang={lang}>
        <h1 ref={headingRef} tabIndex={headingRef ? -1 : undefined} className="text-3xl font-normal tracking-tight outline-none">
          {title}
        </h1>
        {subtitle ? <p className="mt-1 text-muted">{subtitle}</p> : null}
        {children}
      </header>
    </>
  );
}

export function SearchField(props: {
  id: string;
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  label: string;
  clearLabel: string;
}) {
  return (
    <div className="flex items-center gap-[12px] rounded-full bg-surface px-[20px] focus-within:outline-2 focus-within:outline-text">
      <Search aria-hidden="true" className="size-5 shrink-0 text-muted" />
      <label className="sr-only" htmlFor={props.id}>
        {props.label}
      </label>
      <input
        id={props.id}
        type="search"
        className="min-h-14 flex-1 bg-transparent text-text placeholder:text-muted focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        enterKeyHint="search"
      />
      {props.value !== '' ? (
        <button
          type="button"
          onClick={() => props.onChange('')}
          aria-label={props.clearLabel}
          className="-mr-2 grid size-11 shrink-0 place-items-center rounded-full text-muted"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      ) : null}
    </div>
  );
}

export function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="grid size-11 place-items-center rounded-full bg-surface">
      <ArrowLeft aria-hidden="true" className="size-5" />
    </button>
  );
}

export function MessageState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="px-6 py-12 text-center" role="status">
      <p className="text-lg font-semibold">{title}</p>
      {body ? <p className="mt-2 text-muted">{body}</p> : null}
    </div>
  );
}

// Page frame: safe-area padding at the top and room at the bottom for the floating tab bar.
export function Page({ children }: { children: ReactNode }) {
  return <main className="mx-auto max-w-2xl px-[16px] pt-[max(1rem,env(safe-area-inset-top))] pb-[calc(96px+env(safe-area-inset-bottom))]">{children}</main>;
}

// Sub-page navigation within one page (D-034): links, so each sub-page has its own address,
// with the current one marked. Switching replaces the history entry (onSelect).
export function SubNav<T extends string>(props: {
  label: string;
  items: { key: T; label: string; href: string }[];
  current: T;
  onSelect: (href: string) => void;
}) {
  const { label, items, current, onSelect } = props;
  return (
    <nav aria-label={label}>
      {/* Items share the width; at large text sizes they wrap to a second row instead of scrolling. */}
      <ul className="flex flex-wrap gap-[2px] rounded-[24px] bg-surface p-[4px]">
        {items.map((item) => {
          const active = item.key === current;
          return (
            <li key={item.key} className="flex-auto">
              <a
                href={item.href}
                aria-current={active ? 'page' : undefined}
                onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  if (!active) onSelect(item.href);
                }}
                className={`flex min-h-11 w-full items-center justify-center rounded-full px-[10px] text-sm font-medium whitespace-nowrap ${
                  active ? 'bg-accent text-on-accent' : 'text-muted'
                }`}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// A choice between a few options, shown as a segmented pill row (radio buttons underneath).
// `legendHidden` keeps the legend for screen readers only, e.g. Forråd's category bar (D-054).
export function Choice<T extends string>(props: { name: string; legend: string; value: T; onChange: (value: T) => void; options: { value: T; label: string; lang?: string }[]; legendHidden?: boolean }) {
  const { name, legend, value, onChange, options, legendHidden } = props;
  return (
    <fieldset>
      <legend className={legendHidden ? 'sr-only' : 'mb-2 font-semibold'}>{legend}</legend>
      <div className="flex flex-wrap gap-[2px] rounded-[24px] bg-background p-[4px]">
        {options.map((o) => (
          <label
            key={o.value}
            lang={o.lang}
            className={`relative flex min-h-11 flex-auto cursor-pointer items-center justify-center rounded-full px-[12px] text-sm font-medium has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-text ${
              o.value === value ? 'bg-accent text-on-accent' : 'text-muted'
            }`}
          >
            <input type="radio" name={name} value={o.value} checked={o.value === value} onChange={() => onChange(o.value)} className="sr-only" />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// The gear at the top right of the tab pages (D-046): Settings is no longer a tab.
export function SettingsButton({ label }: { label: string }) {
  return (
    <a href={hrefs.settings} aria-label={label} className="grid size-11 shrink-0 place-items-center rounded-full bg-surface">
      <Settings aria-hidden="true" className="size-5" />
    </a>
  );
}

// The title row of a tab page: the title on the left, the settings gear on the right.
export function TabHeader({ title, settingsLabel, children }: { title: string; settingsLabel: string; children?: ReactNode }) {
  return (
    <header className="mt-2 mb-4 flex items-center justify-between gap-[12px] px-1">
      <h1 className="text-3xl font-normal tracking-tight">{title}</h1>
      <div className="flex items-center gap-[8px]">
        {children}
        <SettingsButton label={settingsLabel} />
      </div>
    </header>
  );
}

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

  // Fitted above the keyboard (lib/keyboardFit.ts): without a keyboard nothing is changed.
  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    const root = document.documentElement;
    root.classList.add('sheet-open');
    const vv = window.visualViewport;
    const fit = () => {
      if (!vv) return;
      const place = keyboardFit({ layoutHeight: root.clientHeight, visibleTop: vv.offsetTop, visibleHeight: vv.height });
      dialog.style.bottom = place ? `${place.lift}px` : '';
      dialog.style.maxHeight = place ? `${place.maxHeight}px` : '';
    };
    fit();
    vv?.addEventListener('resize', fit);
    vv?.addEventListener('scroll', fit);
    return () => {
      vv?.removeEventListener('resize', fit);
      vv?.removeEventListener('scroll', fit);
      dialog.style.bottom = '';
      dialog.style.maxHeight = '';
      if (!document.querySelector('dialog.sheet[open]:not([data-closing])')) root.classList.remove('sheet-open');
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
      className="sheet inset-x-0 top-auto bottom-0 m-0 mx-auto max-h-[85dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] border-t border-border bg-background p-0 text-text shadow-2xl backdrop:bg-black/50 open:flex"
    >
      <div className="min-h-0 flex-1 scroll-pt-24 overflow-y-auto overscroll-contain px-[16px] pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{open ? children : last.current}</div>
    </dialog>
  );
}

// A warning that stays in view, in the guides' warning style (D-071): what a tool cannot do.
export function WarningNote({ title, children }: { title?: ReactNode; children: ReactNode }) {
  return (
    <div role="note" className="flex gap-[12px] rounded-2xl bg-note-bg px-[16px] py-3 text-note-text">
      <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div className="flex flex-col gap-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <p className="font-medium">{children}</p>
      </div>
    </div>
  );
}

// The top of a sheet (D-070): its title, and the one way to close it, an X at the top right. Lines
// under the title go in `children`. It stays at the top while the sheet scrolls (S-015), so closing
// is always one tap away. `autofocus`: focus starts on the title (a sheet that is already filled
// in, D-053), not on a field whose keyboard would cover it.
export function SheetHeader({ id, title, closeLabel, onClose, autofocus = false, children }: { id: string; title: ReactNode; closeLabel: string; onClose: () => void; autofocus?: boolean; children?: ReactNode }) {
  return (
    <div className="sticky -top-4 z-10 -mx-[16px] -mt-4 flex items-start justify-between gap-[12px] border-b border-border bg-background px-[20px] pt-4 pb-3">
      <div className="min-w-0 pt-1">
        <h2 id={id} tabIndex={-1} data-autofocus={autofocus ? '' : undefined} className="text-xl font-semibold outline-none">
          {title}
        </h2>
        {children}
      </div>
      <IconButton label={closeLabel} Icon={X} onClick={onClose} className="-mr-1 bg-surface" />
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
        <div className="flex flex-col gap-4 px-1">
          <div>
            <h2 id={id} className="text-xl font-semibold">
              {pending.title}
            </h2>
            {pending.body ? <p className="mt-1 text-muted">{pending.body}</p> : null}
          </div>
          <div className="flex flex-col gap-[8px]">
            <Button variant={pending.danger ? 'danger' : 'primary'} onClick={() => answer(true)}>
              {pending.confirmLabel}
            </Button>
            <Button variant="onPage" onClick={() => answer(false)} data-autofocus="">
              {pending.cancelLabel}
            </Button>
          </div>
        </div>
      ) : null}
    </Sheet>
  );
  return { confirm, sheet };
}

// A short message that floats near the top of the screen and goes away by itself (D-053), e.g.
// "Makrel i tomat er tilføjet". A new `id` shows the message again, even with the same text. The
// live region is always there, so screen readers read each message; taps go through it.
export type ToastMessage = { id: number; text: string };
export function Toast({ message, onHide }: { message: ToastMessage | null; onHide: () => void }) {
  const hide = useRef(onHide);
  hide.current = onHide;
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => hide.current(), 2500);
    return () => window.clearTimeout(timer);
  }, [message]);
  return (
    <div role="status" className="pointer-events-none fixed inset-x-0 top-[calc(max(1rem,env(safe-area-inset-top))+3.75rem)] z-40 flex justify-center px-[16px]">
      {message ? (
        <p key={message.id} className="flex max-w-full items-center gap-[8px] rounded-full bg-ink px-[18px] py-3 font-medium text-on-ink shadow-xl">
          <Check aria-hidden="true" className="size-5 shrink-0" />
          {message.text}
        </p>
      ) : null}
    </div>
  );
}

// A number with − and + buttons (44 pt each), e.g. how many people or how many of a thing. The
// number is a field too (D-054): tap it and type. A typed number is used as soon as it is a valid
// one within min..max; leaving the field shows the value in use again. `decimal` allows a comma
// (water), formatted for `lang`.
export function Stepper({ label, value, min, max, onChange, decimal }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void; decimal?: { lang: Lang } }) {
  const [text, setText] = useState<string | null>(null); // what is typed, while the field has focus
  const id = useId();
  const shown = decimal ? decimalForInput(value, decimal.lang) : String(value);
  const step = (by: number) => {
    setText(null);
    onChange(Math.min(max, Math.max(min, Math.round((value + by) * 100) / 100)));
  };
  return (
    <div className="flex items-center justify-between gap-[12px]">
      <span className="font-semibold" id={id}>
        {label}
      </span>
      <span className="flex items-center gap-[4px]" role="group" aria-labelledby={id}>
        <button type="button" onClick={() => step(-1)} disabled={value <= min} aria-label={`${label} −1`} className="grid size-11 place-items-center rounded-full bg-background text-xl disabled:opacity-40">
          −
        </button>
        <input
          value={text ?? shown}
          onChange={(e) => {
            setText(e.target.value);
            const n = parseCounter(e.target.value, min, max, Boolean(decimal));
            if (n !== null && n !== value) onChange(n);
          }}
          onFocus={(e) => e.target.select()}
          onBlur={() => setText(null)}
          aria-label={label}
          inputMode={decimal ? 'decimal' : 'numeric'}
          autoComplete="off"
          enterKeyHint="done"
          className="h-11 w-16 rounded-xl border border-border bg-background text-center text-lg tabular-nums"
        />
        <button type="button" onClick={() => step(1)} disabled={value >= max} aria-label={`${label} +1`} className="grid size-11 place-items-center rounded-full bg-background text-xl disabled:opacity-40">
          +
        </button>
      </span>
    </div>
  );
}
