# Decisions

Each entry records the decision, why, and what else was considered. Superseded entries are marked, not deleted. Numbers are S-NNN, apart from stead's D-NNN.

---

## S-001: A new app, on stead's stack

- **Date:** 2026-11-07
- **Decision (owner):** an everyday food-storage app, Spisekammer (working name), in its own repo `C:\Users\Theis\app-projects\spisekammer` (GitHub `illusive/spisekammer` later).
  - It is a PWA on stead's stack: React 19, Vite 8, Tailwind 4, `vite-plugin-pwa` with our own service worker, and TypeScript.
  - Forråd's code is **copied and adapted**, not shared: `ui.tsx`, `localStore`, the update banner and service worker, and later the scanner, barcode lookup, size parser and sheets.
  - The two apps can drift apart.
- **Own identity:** a cache prefix (`spisekammer-`), storage keys (`spisekammer.*`), and its own origin when deployed, so it never touches stead's caches or data on a shared host.
- **Design:** friendlier than stead:
  - cream, sage green and terracotta
  - the rounded Nunito font, bundled
  - larger radii (cards 24 px, hero 32 px)
  - the same token names, so the primitives work unchanged
- **Alternatives:** a second app in stead's repo with a shared package (it ties the two together); a native app (app stores, a different stack).

## S-002: Places, and a household that syncs

- **Date:** 2026-11-07
- **Decision (owner):** each thing has a **place**: Køleskab, Fryser, Skab, or the household's own. The place decides which keeping times apply. (Køleskab became optional, off by default: S-007.)
- **Household sync from the start.** Members of one household share one inventory.
- **Supabase, EU region** (the project is in eu-west-1, Ireland).
- **Offline use is ours to build:** IndexedDB on the phone, an outbox of changes, and pulling changes since the last sync plus Realtime. Counts are sent as operations (+1 / −2), so two people taking things at once are both counted.
- **Sign-in:** a 6-digit email code, not a magic link, which would open Safari instead of the installed app.
- **Alternatives:** phone-only with a backup file (no sharing); Firebase (offline sync built in, but harder to move); self-hosted PocketBase (we run the server).

## S-003: The package date first; estimates from ground rules

- **Date:** 2026-11-07
- **Decision (owner):** when the package's date is entered, it is shown first.
- **The estimate** (`docs/ARCHITECTURE.md` §3) fills in when there is no date, and takes over after opening or a change of place. It comes from the food type (USDA FoodKeeper, CC0), the place and the day.
- **"Sidste anvendelsesdato" is never extended.** "Bedst før" past its date means "brug dine sanser".
- **Alternatives:** always the estimate, with the printed date as a note.

## S-004: Barcodes, Open Food Facts plus a shared catalogue

- **Date:** 2026-11-07
- **Decision (owner):** Open Food Facts first.
- **A shared catalogue:** when a product is unknown, what one user types (name, size, category, food type) fills it in for the next.
- **No ODbL derivative:** the catalogue holds only what users typed. Open Food Facts results are cached per phone, not copied into it.
- **Optionally,** offer to add the product to Open Food Facts.
- **Alternatives:** a paid barcode API (cost and terms); Open Food Facts only (patchy Danish coverage).

## S-005: The overview by place, then category

- **Date:** 2026-11-07
- **Decision (owner):**
  - Home has search across everything on top, then "Brug snart" across all places, then the places.
  - A place shows its things grouped by food category.
- **Alternatives:** one list by category, with the place as a label.

## S-006: The local inventory

- **Date:** 2026-11-07
- **Storage:** IndexedDB through `idb` (8.0.4, ISC, about 1 kB). The database `spisekammer` has two stores: `items` (by id) and `products` (by barcode, what this phone has learnt). The state is kept in memory and read with `useSyncExternalStore`. Changes are pure functions that return the new state and the rows to write, so slice 5 can put the same rows in an outbox.
  - **Alternative:** Dexie (larger, and its sync add-on is not ours to use with Supabase).
- **An item:** a name, an optional brand, a category, a place, a count, an optional size (a number and a unit, or the text), an optional barcode, the day it was added and when it last changed. Dates for keeping times come in slice 3.
- **Taking the last one out** leaves the count at 0 in the sheet, with a note. The thing is deleted when the sheet closes, so a slip of the thumb can be undone with +. Delete asks first.
- **Categories:** 12 (meat, poultry, fish, dairy, produce, bread, dry, canned, drinks, leftovers, frozen, other). Each has a default place.
  - **The guess:** from Open Food Facts' `categories_tags` when a barcode is found, otherwise from words in the name. Phrases ("hakkede tomater") are checked before single words ("tomat"). A word matches at the start of a word in the name, so "Kyllingebryst" is poultry.
  - **Frozen things:** words like "frosne" or "frost" start a thing in the freezer, whatever its category ("Frosne kyllingebryst" is poultry, in the freezer).
  - The user can always change the category and the place before adding.
- **Search** covers the name, the brand, the place and the category. Each word of the query must be found inside some word (Danish compounds: "mælk" finds "Letmælk"), ignoring case and accents. Name matches come first.
- **Scanning** reuses stead's continuous scanner (zxing-wasm, works offline). A barcode already in the household opens "Du har allerede …" with + and "Tag 1 ud". A new barcode is filled from this phone's memory first, then Open Food Facts (online only), then typed.

## S-007: The fridge is optional, off by default

- **Date:** 2026-11-07
- **Decision (owner):** the app is for the freezer and the cupboards. The fridge is a choice in Indstillinger ("Køleskabet med i appen"), off by default.
- **Why:** things in the fridge come and go every day and are often half used. Logging each one is too much work, and a fridge list that is not kept up goes wrong within days, which makes people stop trusting the whole app. The freezer (things forgotten for months) and the cupboards (buying what you already have) are where the app helps most.
- **What it means:**
  - Without the fridge, what would go there starts in the freezer (meat, poultry, fish, leftovers) or the cupboard (the rest). The user can always pick another place.
  - The fridge still shows while it holds things, so nothing disappears after turning it off. Search covers everything.
  - The choice is kept on the phone for now; it becomes a household setting with slice 4.
- **Thawing:** taking something out of the freezer just takes it out. The app does not offer to follow it as it thaws in the fridge (the owner turned that down; it can be revisited).
- **Alternatives:** the fridge as an equal place (as before); the fridge only for short-lived things (meat, fish, leftovers, opened jars); no fridge at all; a "Tøer op" step that keeps thawed meat in "Brug snart" for a day or two.
