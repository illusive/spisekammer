# Architecture

## 1. The app (`web/`)

- **Stack:** a PWA; React with Vite and Tailwind; our own service worker (`web/src/sw.ts`, cache prefix `spisekammer-`), which precaches the app so it starts without a network.
- **Routes:** hash routes (`web/src/router.ts`), with relative paths, so the app runs from any static host.
- **Text:** `web/src/i18n/strings.ts` in Danish and English; formatting in `web/src/i18n/format.ts`.
- **Preferences** (language, the order of places, the last place used): `web/src/settings/preferences.ts`, in localStorage (`spisekammer.preferences.v1`).
- **Primitives:** `web/src/components/ui.tsx`, from stead.

```
web/src/
  App.tsx, main.tsx, router.ts, places.ts, index.css, fonts.css, sw.ts
  components/ui.tsx      Primitives (Card, Button, Sheet, SheetHeader, useConfirm, Stepper, Choice, SearchField, Toast …)
  i18n/                  strings (da, en; a test keeps them in step), format
  lib/                   localStore (for preferences), usePageTitle
  inventory/             model (pure changes), store (IndexedDB, idb), categories (the guess), search, ItemSheet, AddSheet, ItemForm, size
  pwa/                   update banner, update check, offline state
  scan/                  BarcodeScanner (zxing-wasm, from stead), barcode (Open Food Facts lookup)
  screens/               Home, Place, Scan, Settings
  settings/preferences.ts
```

## Tests (S-019)

- **Unit tests** (Vitest, `npm test`): the pure parts, such as the model, the dates, the food-group guess, names and sizes, the order of places and the keyboard fit. The database rules run on real Postgres with PGlite (`src/account/schema.test.ts`).
- **End-to-end tests** (Playwright, `npm run test:e2e`, `web/e2e/`): against the production build, in `webkit-iphone` (iPhone 13) and `chromium-android` (Pixel 7). `e2e/fixtures.ts` starts the app (skipping the first start) and writes places and things into IndexedDB. `e2e/layout.ts` holds the layout checks: the sheet inside the screen with its header and scrolling content, the page scrolling after a sheet, no sideways scroll, tap targets of 44 by 24 px, and fields of 48 px.
- **CI** runs both before every deploy (`.github/workflows/pages.yml`), and keeps the Playwright report when a test fails.

## 2. Data and sync (slices 2 and 4 done; 5 planned)

- **On the phone (now, S-006):** IndexedDB (`spisekammer`: `items` by id, `products` by barcode) through `web/src/inventory/store.ts`. The state lives in memory; each change is a pure function in `model.ts` returning the new state and the rows to write.
- **Accounts (S-011):** `web/src/account/` (`account.ts` sign-in and the household calls, `config.ts` the project URL and anon key) and `screens/HouseholdScreen.tsx`, loaded lazily with supabase-js. The schema, row-level security and functions are in `supabase/migrations/`, tested by `web/src/account/schema.test.ts` on PGlite.
- **Places (S-013):** stored with the things (IndexedDB `places`), each with a kind (`freezer`, `fridge`, `pantry`). `web/src/places.ts` has pure helpers (names, the place for a kind, the starting places); `screens/PlacesScreen.tsx` adds, edits and deletes them.
- **With sync (planned):** the household's places too, plus an **outbox** of changes. Every change applies locally at once.
- **On the server:** Supabase (Postgres, EU), with row-level security on `household_id`.
  - Tables: `households`, `household_members`, `invites`, `places`, `items`, and `products` (the shared catalogue).
- **Sync:**
  - The outbox is sent when there is a connection.
  - Pulls fetch the rows changed since the last sync, with Realtime while the app is open.
  - Each field: the last change wins (the server's `updated_at`).
  - Counts are sent as operations through an RPC.
  - A deletion marker (`deleted_at`) wins over an edit.
- **Secrets:** the app holds only the project URL and the anon key. Migrations live in `supabase/`. The database password stays in a local, git-ignored `.env`.

## 3. Dates and kinds of food (S-021, S-022)

- **No estimates.** A thing has `date` only when the user gives one, with `datePrecision`: `day` in a fridge place, `month` elsewhere (stored as the month's last day). Code: `web/src/keeping/` (`rules.ts`: urgency and month ends; `itemKeeping.ts`; `DateInfo.tsx`: the list line, the sheet's line with the overdue warning, and the date field).
- **"Brug snart":** past, today, or within 3 days (Køl), 14 (Tørvarer) or 30 (Frost).
- **Kinds of food:** 12 groups in `web/src/inventory/categories.ts`, guessed from whole words in the name (or the end or start of a compound) and from Open Food Facts' category tags; no match is Andet. Tested in `categories.test.ts`.
- **Names:** `web/src/lib/name.ts` gives a capital first letter and takes brands out of scanned names (not for drinks).
- **One line per thing:** `addItem` adds to the count of the same name, size and place.
- **Wording:** never "safe".

