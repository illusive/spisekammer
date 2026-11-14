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
  - Primitives are in `web/src/components/ui.tsx`, copied from stead and kept in step by hand.
  - Before adding a dependency, check browser support (Safari on iPhone first), maintenance, licence, size, and whether what we have covers it already.
- **Shared code:** use the existing primitives (`Sheet`, `SheetHeader`, `useConfirm`, `Stepper`, `Choice`, `SearchField`, `Toast`) and the tokens in `web/src/index.css`.
- **Text:** every visible text has a key in Danish and English (`web/src/i18n/strings.ts`). A test keeps them in step.
- **Food safety:**
  - Keeping times come only from traced sources (FoodKeeper CC0, Danish rules).
  - They are always an estimate. A use-by date is never extended.
  - Never write "safe".
- **Secrets:** the database password and the service key never go in the repo or the app. The app uses only the project URL and the public anon key. Local secrets go in git-ignored `.env` files.

## Checks after a change

- **Every change:** `npm run typecheck`, `npm test` and `npm run build` in `web/`.
- **Anything on screen:** also `npm run test:e2e` (WebKit and Chromium at phone size, S-019). Add a check to `web/e2e/` for what the change should hold, and fix the app when a check fails, never the check.
- **For the interface:** look at it at phone width, light and dark, with large text.
- **For sync:** two clients.
- **On the iPhone:** the camera, offline use, the installed app, and sign-in.

## Priority when things compete

1. Correctness and food safety wording.
2. Working without a connection, and keeping data safe.
3. Ease and accessibility.
4. Simplicity.
5. Performance.
6. Polish and extras.
