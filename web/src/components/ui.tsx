// Shared UI primitives in the look of the owner's Shelfwise (S-023): paper, deep green, lime; flat
// rows with dividers; outlined round icon buttons. They no longer track stead's. Sheets are in
// sheet.tsx, the toast in toast.tsx, the counter in Stepper.tsx (S-024). Colours, radii and shadows
// come from the tokens in index.css. Text and vertical spacing are rem-based so they follow the
// system text size on iOS; horizontal padding is in px so large text does not squeeze the column.

import { ArrowLeft, ArrowRight, ChevronRight, Search, Settings, TriangleAlert, X, type LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes, ElementType, HTMLAttributes, ReactNode, Ref } from 'react';
import { goBack, hrefs } from '../router';

// A white card with a soft line. A <div> unless `as` says otherwise (a form, a labelled section).
export function Card({ children, className = '', as: Tag = 'div', ...rest }: { children: ReactNode; className?: string; as?: ElementType } & HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={`rounded-card border border-line-soft bg-surface px-[16px] py-4 ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

// Buttons (Shelfwise): `primary` deep green, the page's main action, with `arrow` the lime circle
// and arrow at its end; `secondary` white with a line; `accent` a lime pill (on dark, the scanner);
// `danger` pale red, for deleting; `link` a text action (underlined), and `action` one with an icon
// (not underlined), both 44 px high.
// ButtonLink is a link that looks the same.
type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'danger' | 'link' | 'action';
const BUTTON: Record<ButtonVariant, string> = {
  primary: 'min-h-12 rounded-field bg-primary px-[18px] text-on-primary',
  secondary: 'min-h-12 rounded-field border border-border bg-surface px-[18px] text-primary',
  accent: 'min-h-12 rounded-full bg-accent px-[20px] text-on-accent',
  danger: 'min-h-12 rounded-field bg-danger-bg px-[18px] text-danger',
  link: 'min-h-11 min-w-11 px-[6px] text-sm underline underline-offset-4',
  action: 'min-h-11 min-w-11 px-[6px] text-sm',
};
const buttonClass = (variant: ButtonVariant, className = '') =>
  `inline-flex items-center justify-center gap-[8px] text-center font-semibold transition-transform active:scale-[0.98] disabled:opacity-50 ${BUTTON[variant]} ${className}`;

export function Button({ variant = 'secondary', arrow = false, className, type = 'button', children, ...rest }: { variant?: ButtonVariant; arrow?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={buttonClass(variant, `${variant === 'link' || variant === 'action' ? '' : 'w-full'} ${arrow ? 'justify-between pr-[8px]' : ''} ${className ?? ''}`)} {...rest}>
      {arrow ? <span className="flex items-center gap-[8px]">{children}</span> : children}
      {arrow ? (
        <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
          <ArrowRight className="size-4" />
        </span>
      ) : null}
    </button>
  );
}

export function ButtonLink({ variant = 'secondary', className, href, label, children }: { variant?: ButtonVariant; className?: string; href: string; label?: string; children: ReactNode }) {
  return (
    <a href={href} aria-label={label} className={buttonClass(variant, className)}>
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
export const fieldClass = 'block h-12 w-full min-w-0 appearance-none rounded-field border border-border bg-surface px-[12px] text-lg text-text placeholder:text-muted';
export const selectClass = `${fieldClass} select-field pr-[40px]`;

// A field's label: semibold, with "(valgfri)" when it is optional.
export function FieldLabel({ htmlFor, optional, children }: { htmlFor?: string; optional?: string; children: ReactNode }) {
  const Tag = htmlFor ? 'label' : 'span';
  return (
    <Tag htmlFor={htmlFor} className="mb-1 block font-semibold">
      {children}
      {optional ? <span className="font-normal text-muted"> ({optional})</span> : null}
    </Tag>
  );
}

// A list of rows on the page, with lines between them (Shelfwise). role="list": Safari drops the
// list role when the list style is none.
export function RowList({ children, ordered = false, label, lang }: { children: ReactNode; ordered?: boolean; label?: string; lang?: string }) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag role="list" aria-label={label} className="flex flex-col divide-y divide-line-soft border-y border-line-soft" lang={lang}>
      {children}
    </Tag>
  );
}

// The inside of every row (S-024): something in front (a bubble), the title, a muted line or two
// under it, something at the end (a count), and a chevron unless `trailing` replaces it.
export function RowBody({ leading, title, subtitle, value, trailing }: { leading?: ReactNode; title: ReactNode; subtitle?: ReactNode; value?: ReactNode; trailing?: ReactNode }) {
  return (
    <>
      {leading}
      <span className="min-w-0 flex-1">
        <span className="block font-semibold break-words">{title}</span>
        {subtitle}
      </span>
      {value}
      {trailing ?? <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" />}
    </>
  );
}

const rowClass = 'flex min-h-16 w-full items-center gap-[12px] py-3 text-left';

export function LinkRow({ href, label, ...body }: { href: string; label?: string } & Parameters<typeof RowBody>[0]) {
  return (
    <li>
      <a href={href} aria-label={label} className={rowClass}>
        <RowBody {...body} />
      </a>
    </li>
  );
}

export function ButtonRow({ onClick, dialog = true, label, ...body }: { onClick: () => void; dialog?: boolean; label?: string } & Parameters<typeof RowBody>[0]) {
  return (
    <button type="button" aria-haspopup={dialog ? 'dialog' : undefined} aria-label={label} onClick={onClick} className={rowClass}>
      <RowBody {...body} />
    </button>
  );
}

// A muted line under a row's title.
export function RowLine({ children, mono = false }: { children: ReactNode; mono?: boolean }) {
  return <span className={`block text-muted ${mono ? 'font-mono text-xs' : 'text-sm'}`}>{children}</span>;
}

// A round bubble in front of a row: an icon on soft green (Shelfwise's store logo).
export function Bubble({ Icon, tone = 'soft' }: { Icon: LucideIcon; tone?: 'soft' | 'lime' }) {
  return (
    <span aria-hidden="true" className={`grid size-11 shrink-0 place-items-center rounded-full ${tone === 'lime' ? 'bg-accent text-on-accent' : 'bg-soft text-on-soft'}`}>
      <Icon className="size-5" strokeWidth={1.75} />
    </span>
  );
}

// A titled part of a page. The title is Shelfwise's small grey label (S-024), so the rows stand out
// and the groups are clearly divided; `count` shows a number at the right, `aside` an action.
export function Section({ id, title, count, aside, children, className = '' }: { id: string; title: ReactNode; count?: number; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section aria-labelledby={id} className={`flex flex-col gap-1 ${className}`}>
      <div className="flex min-h-11 items-center justify-between gap-[12px]">
        <h2 id={id} className="font-mono text-xs tracking-[0.06em] text-muted uppercase">
          {title}
        </h2>
        {aside ?? (count !== undefined ? <span className="font-mono text-xs text-muted">{count}</span> : null)}
      </div>
      {children}
    </section>
  );
}

// The big title of a page (Shelfwise's PageTitle): medium weight, tight tracking.
export const pageTitleClass = 'text-[1.75rem] leading-[1.1] font-medium tracking-[-0.045em]';

// The top of a sub-page: back, an optional action on the right, the title and a line under it.
// `headingRef` takes focus once the page has its title (usePageTitle), so VoiceOver announces it.
export function SubPageHeader(props: { backLabel: string; backTo: string; title: ReactNode; subtitle?: ReactNode; action?: ReactNode; headingRef?: Ref<HTMLHeadingElement>; children?: ReactNode }) {
  const { backLabel, backTo, title, subtitle, action, headingRef, children } = props;
  return (
    <>
      <div className="flex items-center justify-between gap-[12px]">
        <IconButton label={backLabel} Icon={ArrowLeft} onClick={() => goBack(backTo)} />
        {action}
      </div>
      <header className="mt-4 mb-5">
        <h1 ref={headingRef} tabIndex={-1} className={`${pageTitleClass} outline-none`}>
          {title}
        </h1>
        {subtitle ? <p className="mt-1 text-muted">{subtitle}</p> : null}
        {children}
      </header>
    </>
  );
}

// The app's name as Shelfwise writes its own: lower case, with a sage full stop.
export function Wordmark({ name }: { name: string }) {
  return (
    <p className="text-xl font-bold tracking-[-0.02em]">
      {name.toLowerCase()}
      <span aria-hidden="true" className="text-sage">
        .
      </span>
    </p>
  );
}

export function SearchField(props: { id: string; value: string; onChange: (text: string) => void; placeholder: string; label: string; clearLabel: string; autofocus?: boolean }) {
  return (
    <div className="flex items-center gap-[12px] rounded-field bg-surface-muted px-[16px] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
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
        data-autofocus={props.autofocus ? '' : undefined}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        enterKeyHint="search"
      />
      {props.value !== '' ? (
        <button type="button" onClick={() => props.onChange('')} aria-label={props.clearLabel} className="-mr-2 grid size-11 shrink-0 place-items-center rounded-full text-muted">
          <X aria-hidden="true" className="size-5" />
        </button>
      ) : null}
    </div>
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

// A message in a tinted box: a warning (amber) or a danger (red). `role` as the message needs:
// "alert" for an error just made, "status" for something that changed, "note" for what stays.
export function Notice({ tone, role = 'note', icon = false, children }: { tone: 'warning' | 'danger'; role?: 'alert' | 'status' | 'note'; icon?: boolean; children: ReactNode }) {
  return (
    <div role={role} className={`flex gap-[10px] rounded-field px-[14px] py-3 text-sm font-semibold ${tone === 'danger' ? 'bg-danger-bg text-danger' : 'bg-warning-bg text-warning-text'}`}>
      {icon ? <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> : null}
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

// Page frame: Shelfwise's 18 px gutter, safe-area padding at the top and room at the bottom, more
// with the floating menu (`nav`).
export function Page({ nav = false, children }: { nav?: boolean; children: ReactNode }) {
  return <main className={`mx-auto max-w-xl px-[18px] pt-[max(1rem,env(safe-area-inset-top))] ${nav ? 'pb-[calc(var(--nav-room)+env(safe-area-inset-bottom))]' : 'pb-[calc(2.5rem+env(safe-area-inset-bottom))]'}`}>{children}</main>;
}

// A choice between a few options, shown as a segmented control (Shelfwise): a muted track, the
// chosen one deep green (radio buttons underneath). Long labels wrap to a second row.
// `legendHidden` keeps the legend for screen readers only.
export function Choice<T extends string>(props: { name: string; legend: string; value: T; onChange: (value: T) => void; options: { value: T; label: string; lang?: string }[]; legendHidden?: boolean }) {
  const { name, legend, value, onChange, options, legendHidden } = props;
  return (
    <fieldset>
      <legend className={legendHidden ? 'sr-only' : 'mb-2 font-semibold'}>{legend}</legend>
      <div className="flex flex-wrap gap-[3px] rounded-field bg-surface-muted p-[3px]">
        {options.map((o) => (
          <label
            key={o.value}
            lang={o.lang}
            className={`relative flex min-h-11 flex-auto basis-0 cursor-pointer items-center justify-center rounded-[7px] px-[12px] text-center text-sm font-semibold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary ${
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
