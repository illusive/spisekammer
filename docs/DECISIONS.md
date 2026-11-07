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
- **Decision (owner):** each thing has a **place**: Køleskab, Fryser, Skab, or the household's own. The place decides which keeping times apply.
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
