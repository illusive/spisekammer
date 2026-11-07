# Architecture

## 1. The app (`web/`)

- **Stack:** a PWA; React with Vite and Tailwind; our own service worker (`web/src/sw.ts`, cache prefix `spisekammer-`), which precaches the app so it starts without a network.
- **Routes:** hash routes (`web/src/router.ts`), with relative paths, so the app runs from any static host.
- **Text:** `web/src/i18n/strings.ts` in Danish and English; formatting in `web/src/i18n/format.ts`.
- **Preferences** (language, theme): `web/src/settings/preferences.ts`, in localStorage (`spisekammer.preferences.v1`).
- **Primitives:** `web/src/components/ui.tsx`, from stead.

```
web/src/
  App.tsx, main.tsx, router.ts, places.ts, index.css, fonts.css, sw.ts
  components/ui.tsx      Primitives (Card, Button, Sheet, SheetHeader, useConfirm, Stepper, Choice, SearchField, Toast …)
  i18n/                  strings (da, en; a test keeps them in step), format
  lib/                   localStore (for preferences), usePageTitle
  pwa/                   update banner, update check, offline state
  screens/               Home, Place, Settings
  settings/preferences.ts
```

## 2. Data and sync (slices 2, 4 and 5; planned)

- **On the phone:** IndexedDB holds the household's places and items, plus an **outbox** of changes. Every change applies locally at once.
- **On the server:** Supabase (Postgres, EU), with row-level security on `household_id`.
  - Tables: `households`, `household_members`, `invites`, `places`, `items`, and `products` (the shared catalogue).
- **Sync:**
  - The outbox is sent when there is a connection.
  - Pulls fetch the rows changed since the last sync, with Realtime while the app is open.
  - Each field: the last change wins (the server's `updated_at`).
  - Counts are sent as operations through an RPC.
  - A deletion marker (`deleted_at`) wins over an edit.
- **Secrets:** the app holds only the project URL and the anon key. Migrations live in `supabase/`. The database password stays in a local, git-ignored `.env`.

## 3. Keeping times (slice 3; planned)

- **Food types:** about 200, built from USDA FoodKeeper (CC0, v128) by an import script. Each has Danish names, a category, suitable places, and durations per place and basis (from purchase, after opening, after thawing). Durations are ranges, each traced to its FoodKeeper ID.
- **The estimate:** `keepBy = start + the low end of the range`, where the start is the day added, opened, frozen or thawed.
- **The package date:**
  - "Sidste anvendelsesdato" is never extended. After opening, the earlier of the two applies.
  - "Bedst før" is shown. Past it: "brug dine sanser".
- **Places:**
  - Into the freezer: a new clock.
  - Out of it: the after-thawing time, or the fridge time from today.
  - A place the type is not recommended for: a warning.
- **Wording:** always guidance, never "safe".
