# AGENTS.md: working on Spisekammer

Read `PROJECT.md` first, then `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/ROADMAP.md` and `docs/OPEN_QUESTIONS.md`. This guide follows stead's (`../offline-knowledge/AGENTS.md`), trimmed for an everyday app.

## How to work

- **Ask before building.** For each substantial feature, settle the user problem, the behaviour offline and when syncing, the data and its lifecycle, accessibility, privacy and testability. Ask in small groups, and recommend an approach.
- **Record decisions** in `docs/DECISIONS.md` (S-NNN) before or with the change. Keep the docs current, and remove what contradicts them.
- **Work in small vertical slices** that build, test and run. Summarise what changed, what was checked, and what was not.
- **Never claim a test that was not run.** Keep apart what was checked automatically and what still needs the iPhone.

## Engineering

- **Local first.** The inventory works fully without a network:
  - Changes apply locally at once and sync later (`docs/ARCHITECTURE.md` §2).
  - The barcode lookup and sync are the only network uses so far. Any new one needs a decision.
- **Stack:** React, Vite, Tailwind, `vite-plugin-pwa` with our own service worker, and TypeScript in strict mode.
  - Primitives are in `web/src/components/ui.tsx`, in the look of the owner's Shelfwise (S-023); they no longer follow stead's.
  - Before adding a dependency, check browser support (Safari on iPhone first), maintenance, licence, size, and whether what we have covers it already.
- **Shared code:** use the existing parts before writing new markup: `components/ui.tsx` (`Button` with its `link` and `action` looks, `RowList`, `RowBody`/`LinkRow`/`ButtonRow`, `Section`, `Notice`, `FieldLabel`, `Choice`, `SearchField`, `SubPageHeader`, `Page`), `components/sheet.tsx` (`Sheet`, `SheetHeader`, `useConfirm`), `components/toast.tsx` (`useToast`), `components/Stepper.tsx`, `inventory/useInventoryActions.tsx` (the menu and its sheets) and `inventory/addThing.ts`, plus the tokens in `web/src/index.css` (colours, `rounded-field`, `shadow-float`, `shadow-sheet`, `bg-overlay`).
- **Text:** every visible text has a key in Danish and English (`web/src/i18n/strings.ts`). A test keeps them in step.
- **Food safety:**
  - The app shows only the dates the user gives; it never estimates one (S-021).
  - A passed date says so, with "look, smell and taste" and "throw out meat, fish and leftovers".
  - Never write "safe".
- **Secrets:** the database password and the service key never go in the repo or the app. The app uses only the project URL and the public anon key. Local secrets go in git-ignored `.env` files.

## Checks after a change

- **Every change:** `npm run typecheck`, `npm test` and `npm run build` in `web/`.
- **Anything on screen:** also `npm run test:e2e` (WebKit and Chromium at phone size, S-019). Add a check to `web/e2e/` for what the change should hold, and fix the app when a check fails, never the check.
- **For the interface:** look at it at phone width and with large text (the look is light only, S-023).
- **For sync:** two clients.
- **On the iPhone:** the camera, offline use, the installed app, and sign-in.

## Priority when things compete

1. Correctness and food safety wording.
2. Working without a connection, and keeping data safe.
3. Ease and accessibility.
4. Simplicity.
5. Performance.
6. Polish and extras.
