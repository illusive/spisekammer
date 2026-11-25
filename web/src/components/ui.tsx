// Shared UI primitives. First copied from stead; since S-023 they follow the look of the owner's
// Shelfwise (paper, deep green, lime; flat rows with dividers; outlined round icon buttons) and no
// longer track stead. Colours come from the tokens in index.css. Text and vertical spacing are
// rem-based so they follow the system text size on iOS; horizontal padding is in px so large text
// does not squeeze the content column.

import { ArrowLeft, ArrowRight, Check, ChevronRight, Search, Settings, TriangleAlert, X, type LucideIcon } from 'lucide-react';
import { decimalForInput, parseCounter } from '../i18n/format';
import { keyboardFit } from '../lib/keyboardFit';
import type { Lang } from '../i18n/strings';
import { goBack, hrefs } from '../router';
import { useCallback, useEffect, useId, useReducer, useRef, useState, type ButtonHTMLAttributes, type ElementType, type HTMLAttributes, type ReactNode, type Ref } from 'react';

// A white card with a soft line (Shelfwise's Notice). A <section> unless `as` says otherwise.
export function Card({ children, className = '', as: Tag = 'section', ...rest }: { children: ReactNode; className?: string; as?: ElementType } & HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={`rounded-card border border-line-soft bg-surface px-[16px] py-4 ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

// Buttons (Shelfwise): `primary` deep green, the page's main action, with `arrow` the lime circle
// and arrow at its end; `secondary` white with a line; `accent` a lime pill (on dark, the scanner);
// `ghost` text only; `danger` pale red, for deleting.
// ButtonLink is a link that looks the same.
type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
const BUTTON: Record<ButtonVariant, string> = {
  primary: 'rounded-[10px] bg-primary px-[18px] text-on-primary',
  secondary: 'rounded-[10px] border border-border bg-surface px-[18px] text-primary',
  accent: 'rounded-full bg-accent px-[20px] text-on-accent',
  ghost: 'rounded-[10px] px-[10px] text-primary',
  danger: 'rounded-[10px] bg-danger-bg px-[18px] text-danger',
};
export const buttonClass = (variant: ButtonVariant = 'secondary', className = '') =>
  `flex min-h-12 items-center justify-center gap-[8px] text-center font-semibold transition-transform active:scale-[0.98] disabled:opacity-50 ${BUTTON[variant]} ${className}`;

export function Button({ variant = 'secondary', arrow = false, className, type = 'button', children, ...rest }: { variant?: ButtonVariant; arrow?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={buttonClass(variant, `${arrow ? 'justify-between pr-[8px]' : ''} ${className ?? ''}`)} {...rest}>
      {arrow ? <span className="flex items-center gap-[8px]">{children}</span> : children}
      {arrow ? (
        <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
          <ArrowRight className="size-4" />
        </span>
      ) : null}
    </button>
  );
}

export function ButtonLink({ variant = 'secondary', className, href, children }: { variant?: ButtonVariant; className?: string; href: string; children: ReactNode }) {
  return (
    <a href={href} className={buttonClass(variant, className)}>
      {children}
    </a>
  );
}

// A round 44 pt button with only an icon, an outlined circle (Shelfwise's close and back); the
// label is for screen readers.
const outlineCircle = 'grid size-11 shrink-0 place-items-center rounded-full text-primary shadow-[inset_0_0_0_1.5px_currentColor]';
export function IconButton({ label, Icon, onClick, className = '', ...rest }: { label: string; Icon: LucideIcon; onClick: () => void; className?: string } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className={`${outlineCircle} ${className}`} {...rest}>
      <Icon aria-hidden="true" className="size-5" />
    </button>
  );
}

// Every single-line field looks the same (S-015): one height, border, radius and text size. A
// select gets its own arrow (index.css, .select-field), so it lines up with the text fields; a date
// field keeps its native picker inside the same box.
export const fieldClass = 'block h-12 w-full min-w-0 appearance-none rounded-[10px] border border-border bg-surface px-[12px] text-lg text-text placeholder:text-muted';
export const selectClass = `${fieldClass} select-field pr-[40px]`;

// A list of rows on the page, with lines between them (Shelfwise), and its rows: an optional bubble
// in front, the title, an optional line under it, a chevron.
export const rowListClass = 'flex flex-col divide-y divide-line-soft border-y border-line-soft';
export function RowList({ children, ordered = false, lang }: { children: ReactNode; ordered?: boolean; lang?: string }) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag className={rowListClass} lang={lang}>
      {children}
    </Tag>
  );
}

export function LinkRow({ href, title, subtitle, leading, label }: { href: string; title: ReactNode; subtitle?: ReactNode; leading?: ReactNode; label?: string }) {
  return (
    <li>
      <a href={href} aria-label={label} className="flex min-h-16 items-center gap-[12px] py-3">
        {leading}
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{title}</span>
          {subtitle}
        </span>
        <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" />
      </a>
    </li>
  );
}

// A round bubble in front of a row: an icon on soft green (Shelfwise's store logo).
export function Bubble({ Icon, tone = 'soft' }: { Icon: LucideIcon; tone?: 'soft' | 'lime' }) {
  return (
    <span aria-hidden="true" className={`grid size-11 shrink-0 place-items-center rounded-full ${tone === 'lime' ? 'bg-accent text-on-accent' : 'bg-soft text-on-soft'}`}>
      <Icon className="size-5" strokeWidth={1.75} />
    </span>
  );
}

// A titled part of a page (one heading size everywhere), with an optional aside on the right.
export function Section({ id, title, aside, children, className = '' }: { id: string; title: ReactNode; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section aria-labelledby={id} className={`flex flex-col gap-2 ${className}`}>
      <div className="flex min-h-11 items-center justify-between gap-[12px]">
        <h2 id={id} className="text-lg font-semibold">
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
      <header className="mt-4 mb-5" lang={lang}>
        <h1 ref={headingRef} tabIndex={headingRef ? -1 : undefined} className={`${pageTitleClass} outline-none`}>
          {title}
        </h1>
        {subtitle ? <p className="mt-1 text-muted">{subtitle}</p> : null}
        {children}
      </header>
    </>
  );
}

// The big title of a page (Shelfwise's PageTitle): medium weight, tight tracking.
export const pageTitleClass = 'text-[1.75rem] leading-[1.1] font-medium tracking-[-0.045em]';

export function SearchField(props: {
  id: string;
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  label: string;
  clearLabel: string;
}) {
  return (
    <div className="flex items-center gap-[12px] rounded-[10px] bg-surface-muted px-[16px] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
      <Search aria-hidden="true" className="size-5 shrink-0 text-muted" />
      <label className="sr-only" htmlFor={props.id}>
        {props.label}
      </label>
      <input
        id={props.id}
        type="search"
        className="min-h-12 min-w-0 flex-1 bg-transparent text-lg text-text placeholder:text-muted focus:outline-none [&::-webkit-search-cancel-button]:hidden"
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
    <button type="button" onClick={onClick} aria-label={label} className={outlineCircle}>
      <ArrowLeft aria-hidden="true" className="size-5" />
    </button>
  );
}

export function MessageState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="rounded-card border border-dashed border-border px-6 py-10 text-center" role="status">
      <p className="font-semibold">{title}</p>
      {body ? <p className="mt-2 text-muted">{body}</p> : null}
    </div>
  );
}

// Page frame: Shelfwise's 18 px gutter, safe-area padding at the top and room at the bottom.
export function Page({ children }: { children: ReactNode }) {
  return <main className="mx-auto max-w-xl px-[18px] pt-[max(1rem,env(safe-area-inset-top))] pb-[calc(2.5rem+env(safe-area-inset-bottom))]">{children}</main>;
}

// A choice between a few options, shown as a segmented control (Shelfwise): a muted track, the
// chosen one deep green (radio buttons underneath). Long labels wrap to a second row.
// `legendHidden` keeps the legend for screen readers only.
export function Choice<T extends string>(props: { name: string; legend: string; value: T; onChange: (value: T) => void; options: { value: T; label: string; lang?: string }[]; legendHidden?: boolean }) {
  const { name, legend, value, onChange, options, legendHidden } = props;
  return (
    <fieldset>
      <legend className={legendHidden ? 'sr-only' : 'mb-2 font-semibold'}>{legend}</legend>
      <div className="flex flex-wrap gap-[3px] rounded-[10px] bg-surface-muted p-[3px]">
        {options.map((o) => (
          <label
            key={o.value}
            lang={o.lang}
            className={`relative flex min-h-11 flex-auto cursor-pointer items-center justify-center rounded-[7px] px-[12px] text-center text-sm font-semibold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary ${
              o.value === value ? 'bg-primary text-on-primary' : 'text-muted'
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

// The gear at the top right of Hjem (D-046), an outlined circle like Shelfwise's avatar.
export function SettingsButton({ label }: { label: string }) {
  return (
    <a href={hrefs.settings} aria-label={label} className={outlineCircle}>
      <Settings aria-hidden="true" className="size-5" />
    </a>
  );
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
      className="sheet inset-x-0 top-auto bottom-0 m-0 mx-auto max-h-none w-full max-w-xl overflow-hidden rounded-t-[20px] bg-background p-0 text-text shadow-[0_-12px_40px_rgb(16_43_36/0.18)] backdrop:bg-[rgb(16_43_36/0.48)]"
    >
      {/* The sheet is a plain box; this part has its own height limit and scrolls (S-018: no flex,
          no "open" selector, so older Safari lays it out the same). */}
      <div className="sheet-body scroll-pt-24 overflow-y-auto overscroll-contain px-[18px] pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">{open ? children : last.current}</div>
    </dialog>
  );
}

// A warning that stays in view, in the guides' warning style (D-071): what a tool cannot do.
export function WarningNote({ title, children }: { title?: ReactNode; children: ReactNode }) {
  return (
    <div role="note" className="flex gap-[12px] rounded-card bg-warning-bg px-[16px] py-3 text-warning-text">
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
    <div className="sticky -top-4 z-10 -mx-[18px] -mt-4 border-b border-line-soft bg-background px-[18px] pt-2 pb-3">
      {/* The handle (Shelfwise): only a look; the X closes. */}
      <span aria-hidden="true" className="mx-auto mb-2 block h-1 w-10 rounded-full bg-border" />
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
          <span aria-hidden="true" className="mx-auto -mt-2 block h-1 w-10 rounded-full bg-border" />
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
        <p key={message.id} className="flex max-w-full items-center gap-[10px] rounded-full bg-primary py-3 pr-[18px] pl-[12px] font-semibold text-on-primary shadow-[0_8px_24px_rgb(16_43_36/0.16)]">
          <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
            <Check className="size-4" />
          </span>
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
        <button type="button" onClick={() => step(-1)} disabled={value <= min} aria-label={`${label} −1`} className="grid size-12 place-items-center rounded-full border border-border bg-surface text-xl text-primary disabled:opacity-40">
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
          className="h-12 w-16 rounded-[10px] border border-border bg-surface text-center font-mono text-lg tabular-nums"
        />
        <button type="button" onClick={() => step(1)} disabled={value >= max} aria-label={`${label} +1`} className="grid size-12 place-items-center rounded-full border border-border bg-surface text-xl text-primary disabled:opacity-40">
          +
        </button>
      </span>
    </div>
  );
}
