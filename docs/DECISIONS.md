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
- **Decision (owner):** each thing has a **place**. The place decides which keeping times apply. (The places are now the household's own, each with a kind: S-013.)
- **Household sync from the start.** Members of one household share one inventory.
- **Supabase, EU region** (the project is in eu-west-1, Ireland).
- **Offline use is ours to build:** IndexedDB on the phone, an outbox of changes, and pulling changes since the last sync plus Realtime. Counts are sent as operations (+1 / −2), so two people taking things at once are both counted.
- **Sign-in:** a 6-digit email code, not a magic link, which would open Safari instead of the installed app.
- **Alternatives:** phone-only with a backup file (no sharing); Firebase (offline sync built in, but harder to move); self-hosted PocketBase (we run the server).

## S-003: The package date first; estimates from ground rules (replaced by S-021)

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

## S-007: The fridge is optional, off by default (replaced by S-013)

- **Date:** 2026-11-07
- **Decision (owner):** the app is for the freezer and the cupboards. The fridge is a choice in Indstillinger ("Køleskabet med i appen"), off by default.
- **Why:** things in the fridge come and go every day and are often half used. Logging each one is too much work, and a fridge list that is not kept up goes wrong within days, which makes people stop trusting the whole app. The freezer (things forgotten for months) and the pantry (buying what you already have) are where the app helps most.
- **What it means:**
  - Without the fridge, what would go there starts in the freezer (meat, poultry, fish, leftovers) or the pantry (the rest). The user can always pick another place.
  - The fridge still shows while it holds things, so nothing disappears after turning it off. Search covers everything.
  - The choice is kept on the phone for now; it becomes a household setting with slice 4.
- **Thawing:** taking something out of the freezer just takes it out. The app does not offer to follow it as it thaws in the fridge (the owner turned that down; it can be revisited).
- **Alternatives:** the fridge as an equal place (as before); the fridge only for short-lived things (meat, fish, leftovers, opened jars); no fridge at all; a "Tøer op" step that keeps thawed meat in "Brug snart" for a day or two.

## S-008: "Forråd", not "Skab" (replaced by S-013)

- **Date:** 2026-11-07
- **Decision (owner):** the place for dry and long-keeping things is called **Forråd** (English: "Pantry"). "Skab" (cupboard) did not fit a viktualiekammer, a basement shelf or a larder.
- **Alternatives:** Skab; Spisekammer (the app's own name); Viktualier (old-fashioned).

## S-009: Food types from FoodKeeper, found from the name (replaced by S-021)

- **Date:** 2026-11-07
- **Decision:** the app knows 409 food types, each one USDA FoodKeeper record (CC0, v128, 2018): 101 produce types with stead's checked Danish names, and 308 others chosen for Danish homes with drafted Danish names (`docs/FOOD_TYPES_REVIEW.md`).
- **Where it lives:**
  - The snapshot: `content/sources/foodkeeper-v128.json` (the same file and checksum as stead's).
  - Our lists: `content/food-types.json` and `content/food-types-produce.json` (names, category, keys).
  - The build: `web/scripts/build-food-types.ts` (`npm run build:food-types`) writes `web/src/keeping/food-types.json`, which ships with the app (about 20 kB gzipped).
  - The build refuses a wrong checksum, an unknown ID, a type without times, an unknown value or a key used by two types.
- **Times:** per place (pantry, fridge, freezer), after opening and after thawing. When FoodKeeper gives two columns for one place (from purchase and plain), the cautious one is used: "not recommended" first, then the shorter span.
- **Finding the type from a name:** each word of a key must start a word of the name, in any order ("hakket oksekød" matches "Oksekød, hakket"). A key starting with "=" must be the whole word ("=is"). Small words are skipped. The longest key wins ("kyllingefond" beats "kylling"). The user sees the type and can change it.
- **Alternatives:** asking the user for the type every time (slow); using Open Food Facts categories only (patchy for Danish products); an AI guess (not traceable, and not offline).

## S-010: The keeping rules in the app (replaced by S-021)

- **Date:** 2026-11-07
- **Decision:** the rules in `web/src/keeping/rules.ts`, as planned in S-003:
  - The package date comes first. **Sidste anvendelsesdato** is never extended outside the freezer; after opening or thawing, the earlier of it and the estimate applies. **Bedst før** shows until opened; then the estimate.
  - The estimate: the day it came into its place, was opened or thawed, plus the **low end** of FoodKeeper's range.
  - The freezer starts a new clock. Out of the freezer into the fridge, the after-thawing time (or the fridge time) from that day. The use-by date then applies again, even if it passed while frozen: cautious, and simpler than tracking when it was frozen.
  - No time, or a place advised against: no date, only a note.
- **Shown as:** "Brug senest ca. 12. nov." with the range; "Sidste anvendelsesdato …"; "Bedst før …". Raw meat, fish, leftovers and use-by dates add "Ved tvivl: smid ud". Never "safe". A "Sådan regner appen" page explains it, linked from every thing's sheet and from Indstillinger.
- **Brug snart** on Home: past, today, or within 3 days (fridge), 14 days (pantry) or 30 days (freezer).
- **The thing** gains a food type, the day it came into its place, opened, thawed, and the package date and kind. "Åbnet i dag" sits in its sheet; moving it restarts the place's clock.
- **Tested:** the fixed examples (chicken in the freezer, mince in the fridge, opened jam, milk with a date, out of the freezer), the date arithmetic, and a sweep over every type, place and state checking that no date is later than the use-by date outside the freezer.
- **Alternatives:** the middle of the range (less cautious); always the estimate, with the package date as a note (the owner chose the package date first, S-003).

## S-011: Accounts and households

- **Date:** 2026-11-08
- **Decisions (owner):**
  - **The account is optional.** The app works on the phone without one. "Husstand" in Indstillinger signs in with an email code, to share with the household.
  - **Invites give a link and a code.** A six-letter code (no 0/O, 1/I/L), valid for 7 days, and a link `#/join/CODE` that fills it in. The code helps when the link opens Safari instead of the installed app.
  - **Bringing your things:** when you join with things on the phone, the app asks whether to bring them, with "bring" as the default. This is asked when sync arrives (slice 5); until then things stay on the phone, and the household screen says so.
- **Decisions (ours):**
  - **One household per user** in v1. Joining another means leaving first.
  - **The schema** (`supabase/migrations/20261108000000_households.sql`): `households` (name, fridge setting), `household_members` (role, email), `invites`, `places`, and `items` (ready for slice 5).
  - **Row-level security:** a member reads and changes only their own household's rows. Signed-out users get nothing. Items are never hard-deleted (deletion markers), and the server sets `updated_at` and `updated_by`.
  - **The rules live in database functions:** `create_household`, `create_invite`, `join_household` and `leave_household`. The tables refuse direct inserts and deletes for those. The oldest member becomes owner when the owner leaves; the last one out deletes the household and its things.
  - **Members see each other's email,** so they know who is in. Nothing else about a user is stored.
  - **Tested on real Postgres** with PGlite (`@electric-sql/pglite` 0.5.10, Apache-2.0, dev only): Supabase's roles, `auth.uid()` and default grants are stubbed, and the migration runs unchanged. No Docker needed.
  - **`@supabase/supabase-js` 2.118.0** (MIT), loaded only with the household screen (57 kB gzipped, its own chunk). The main app grew by 2 kB.
  - **Versions:** both pinned exactly, each at least two weeks old.
- **Alternatives:** an account required from the start (simpler data, more friction); a link only, or a code only; several households per user (a household switcher; not needed yet).

## S-012: A sign-in link as well as the code, for trying it out

- **Date:** 2026-11-08
- **Context:** the email templates cannot be edited while the project uses Supabase's built-in email, so the email cannot show the 6-digit code (S-011). The owner wants to try it out before setting up an email provider.
- **Decision (owner):** try it with the built-in email. The app accepts the sign-in link in the email as well as the code.
  - The link uses PKCE: it comes back to the app with `?code=…`, and `web/src/main.tsx` sends it to the household screen, where supabase-js finishes the sign-in. The address is cleaned afterwards.
  - The link works only in the browser that asked for it (a computer, or Safari on an iPhone). Opened elsewhere, or expired, the screen says so.
  - The code stays the main way. With custom SMTP and the code template (`supabase/README.md`), the installed iPhone app signs in without leaving it.
- **Alternatives:** wait for custom SMTP before trying anything; links only (breaks the installed iPhone app).

## S-013: The household's own places, each with a kind

- **Date:** 2026-11-08
- **Decision (owner):** the household makes its own places (more freezers, several cupboards, a cellar) and gives each one a kind. Replaces S-007 (the fridge switch) and S-008 (Forråd).
  - **Three kinds:** **Frost** (freezer), **Køl** (fridge) and **Tørvarer** (cupboard, cellar, viktualiekammer). The kind decides the keeping times; FoodKeeper has times for exactly these three.
  - **Defaults:** Fryser (Frost), Skabe (Tørvarer) and Viktualiekammer (Tørvarer). No fridge: a fridge is a place of the kind Køl that the user adds. The switch in Indstillinger is gone.
  - **Deleting a place** with things in it asks where they go first. The last place cannot be deleted.
- **Details (ours):**
  - Places are stored with the things (IndexedDB `places`, database version 2) and passed to the screens; `web/src/places.ts` has pure helpers.
  - Presets keep their ids, so things added before stay put: `freezer` (Fryser), `pantry` (was Forråd, now Skabe), `larder` (Viktualiekammer). A preset without its own name shows the preset's name in the user's language; renaming it to nothing gives that name back.
  - Moving to another phone version: the first start adds the defaults, plus a fridge if things are in it or the old switch was on, plus a place for any other place a thing points to. Nothing is left without a place.
  - New things go to the first place of the kind their food type suggests. Without a fridge, chilled things go to the freezer (meat, fish, leftovers) or a Tørvarer place.
  - Changing a place's kind changes the keeping times of what is in it, counted from the day each thing came in.
  - **Server:** `supabase/migrations/20261108120000_places.sql` starts new households with the same three places and drops `households.fridge`.
- **Alternatives:** a fourth kind for a cool cellar (FoodKeeper has no times for it; Tørvarer is the cautious choice); keeping the fridge switch as well (two ways to the same thing); deleting a place with its things, or only empty places.

## S-014: A Danish check on freezer times, and "bedst før" in the freezer (replaced by S-021)

- **Date:** 2026-11-08
- **Context:** the owner asked for a Danish source for the times. Fødevarestyrelsen gives the rules (what the dates mean, "efter åbning", a fridge at most 5 °C) but no table of times. Forbrugerrådet Tænk has a short Danish list for the freezer (citing Arla and Fødevarestyrelsen among others) and says freezer times are about quality: food kept longer does not make you ill, as bacteria stop growing at −10 °C.
- **Decisions (owner):**
  - **Freezer times:** where Tænk gives a shorter freezer time than FoodKeeper's low end, the app uses Tænk's (`content/danish-freezer.json`, applied by the build). It only shortens: where FoodKeeper has no freezer time, or advises against freezing, that stands. 51 types are shortened, for example raw chicken 9 → 8 months, lean fish 6 → 3 months, smoked fish 9 months → 3 weeks, frozen vegetables 10 → 6 months, ready meals and leftovers 2 → 1 month.
  - Only Tænk's numbers are used, never its text. Tænk is named on "Sådan regner appen". Its reuse terms are unknown, so we ask (`docs/OPEN_QUESTIONS.md`). Its page stays in stead's snapshots, not in this public repo.
  - **"Bedst før" in the freezer:** a "bedst før / mindst holdbar til" date on a package now counts in the freezer too, since food bought frozen carries its own. A "sidste anvendelsesdato" is still replaced by the freezer time, since freezing stops that clock.
- **Alternatives:** asking Tænk first (keeping three longer times meanwhile); FoodKeeper only; always the package date in the freezer (a use-by date would show as past while the food is still frozen).

## S-015: Adding to one place, a calmer form, and a first start (the place step replaced by S-022)

- **Date:** 2026-11-08
- **Decisions (owner's notes):**
  - **Choose the place first.** "Scan" and "Tilføj" on Hjem ask "Hvor skal tingene hen?", then things are added one after another to that place. The place is no longer in the form. From a place's own page the place is already known. The guesses that picked a place from the name (frozen words, the category's place, the food type's place) are gone.
  - **The sheet's header stays at the top** while the sheet scrolls, so closing is one tap away.
  - **One field style:** every single-line field (text, select, date) is 48 px high with the same border, radius and text size; selects get their own arrow (`fieldClass`, `selectClass` in `components/ui.tsx`).
  - **Search:** Hjem searches everything; each place's page searches that place only.
  - **Indstillinger:** Steder, Del and "Sådan regner appen" come first. "Husstand" is now **"Del"** ("Share").
  - **A first start,** after bikeplanner's setup wizard: a welcome, the places you have (tick presets, add your own), whether to share, and "Du er klar". Shown once, on Hjem, on a phone with nothing in it; "Spring over" keeps the default places. Choosing to share goes to Del afterwards.
- **Camera permission:** a web app cannot avoid the phone's question. Safari can remember "Tillad" for the site, but an installed web app may ask again after it restarts. A real app asks once (`docs/OPEN_QUESTIONS.md`); not now.

## S-016: Sheets and the keyboard

- **Date:** 2026-11-08
- **Problem (owner, on an iPhone):** the whole sheet scrolled as one, so when the keyboard opened the phone pushed the sheet up and the first field went out of view.
- **Decisions:**
  - Only a sheet's content scrolls; its header (title and X) stays at the top.
  - While a sheet is open it is fitted into the part of the screen the keyboard leaves free (the visual viewport), and the page behind does not scroll.
  - **The keyboard opens by itself only when adding by typing** ("Tilføj", and "Uden stregkode" on the scan screen). Every other sheet starts on its title: a scanned thing, a thing's own sheet, a new or existing place, the place picker. After adding a scanned thing, the form no longer puts the cursor back in the name while the sheet closes.
- **Not checked yet:** the keyboard itself on an iPhone (the preview has no on-screen keyboard; the layout was checked at a short screen height).

## S-017: The keyboard fix, measured against the right height

- **Date:** 2026-11-11
- **Problem (owner, on an iPhone):** after S-016 the sheet went completely out of view.
- **Cause:** S-016 measured the keyboard with `window.innerHeight`, which on an iPhone shrinks with the keyboard, just as the visible area does. So the app saw no keyboard and did not lift the sheet, but still shrank the sheet's height to the visible height. That left a short sheet at the very bottom, behind the keyboard.
- **Fix:** `web/src/lib/keyboardFit.ts`, a pure function with tests. It measures against the layout viewport's height (`document.documentElement.clientHeight`), which stays the same when the keyboard opens. When no keyboard covers the bottom (less than 120 px), nothing about the sheet's place is changed. When one does, the sheet is lifted by exactly what is covered, never more, and kept to the visible height.
- **Not checked yet:** on an iPhone. The tests use iPhone-sized numbers; the preview has no on-screen keyboard.

## S-018: The sheet as a plain box, for older Safari

- **Date:** 2026-11-13
- **Problem (owner, on an iPhone):** the sheet opened mostly outside the screen; only its top showed. Not the keyboard.
- **Likely cause:** since S-016 the sheet was a flex column, switched on by Tailwind's `open:` selector (`:is([open], :popover-open, :open)`), with a scrolling part sized by flex. Current WebKit and Chrome lay that out correctly (checked with Playwright's WebKit at iPhone size), but it leans on newer selectors and flex sizing that older Safari handles differently.
- **Fix:** no flex and no `open:` selector. The sheet is a plain box with no height limit of its own (`max-h-none`, which also overrides the browser's default for dialogs). Its scrolling part has the limit (`.sheet-body`: 85 % of the screen, in `dvh` with a `vh` fallback). The keyboard fit (S-017) now limits that part.
- **Checked:** WebKit and Chromium at iPhone width, at full and at short height. The sheet ends exactly at the screen's bottom edge, and its content scrolls. **Not checked:** on the owner's iPhone.

## S-019: Scrolling, the order of places, and end-to-end tests (the order selector replaced by S-022)

- **Date:** 2026-11-14
- **Problem (owner, on an iPhone):** scrolling broke once more things or places were added, and the layout kept misbehaving.
- **Cause of the scrolling:** when a sheet closed, the code that unlocks the page asked the page whether a sheet was still open. The closing sheet itself still counted, so the lock (`html.sheet-open`, `overflow: hidden`) stayed on and the page could not scroll. Open sheets are now counted instead (`components/ui.tsx`). An e2e test fails on the old code and passes on the new.
- **The order of places (owner):**
  - Alphabetical by default (by the name shown, Danish order), on Hjem, in Steder, in the place picker and in "Flyt til" (`orderPlaces` in `places.ts`, `useOrderedPlaces`).
  - Steder has "Rækkefølge: Alfabetisk / Egen". With Egen, places are dragged by a handle: touch (hold, about 180 ms), mouse, or keyboard (space, arrows, space), with Danish and English screen-reader announcements. VoiceOver users, who cannot drag, get "Flyt op" / "Flyt ned" in a place's sheet.
  - Switching to Egen starts from the alphabetical order already shown.
  - Kept per phone for now (`placeOrder` preference); it becomes per household with sync.
  - **Dependency:** dnd-kit (`@dnd-kit/core` 6.3.1, `@dnd-kit/sortable` 10.0.0, `@dnd-kit/utilities` 3.2.2; MIT; React 19 compatible), pinned.
- **End-to-end tests (owner: WebKit and Chromium, in CI):**
  - Playwright 1.64.0, in `web/e2e/`, against the production build.
  - Two projects: `webkit-iphone` (iPhone 13, Safari's engine) and `chromium-android` (Pixel 7).
  - Run with `npm run test:e2e`. CI runs them before every deploy, and only publishes when they pass.
  - Layout checks (`e2e/layout.ts`):
    - the sheet sits inside the screen, keeps its header, and scrolls its content
    - the page scrolls after a sheet closes
    - nothing scrolls sideways
    - every button, link and field is at least 44 px high and 24 px wide
    - every field is 48 px high
  - Flows: the first start, many places and things, the order of places (keyboard, touch, mouse, buttons), adding, search, and offline.
- **What the tests found, and fixed in the app:**
  - The counter between − and + was 44 px while every other field is 48 px. It and its buttons are now 48 px.
  - The "Skift" / "Luk" link next to "Slags" was 23 px wide. It is now at least 44 px.
  - **Offline:** the service worker missed its own cache when a server sends `Vary: Origin`, because Vite's tags ask with an Origin header the install did not send. It now ignores `Vary` (each cached file belongs to one build). GitHub Pages sends only `Vary: Accept-Encoding`, so the live app was likely fine, but it no longer depends on that.
- **Not checked:** on the owner's iPhone. Playwright's WebKit is close to Safari, not the same.

## S-020: Steder from Hjem, and steadier tests

- **Date:** 2026-11-15
- **Decision (owner):** a "Rediger" button with a pencil at the top right of "Steder" on Hjem opens Steder (add, rename, order, delete). Read out as "Rediger steder".
- **"Brug snart" stays as it is (owner):** shown on Hjem when something is past its date, due today, or within 3 days (Køl), 14 days (Tørvarer) or 30 days (Frost).
- **Tests made steadier (no app change):**
  - The drag tests move in steps and let go after the list settles.
  - The offline test polls until the service worker controls the page.
  - The seeding helper opens the database at the app's version with its stores, so it cannot race the app into an empty database.
  - The whole suite ran three times over in both browsers with no failures.

## S-021: No guessed dates; a month outside the fridge; a short list of kinds of food

- **Date:** 2026-11-25
- **Why (owner, after using the app):** the guessed dates, the explanation page and the extra lines were too much, and a wrong food type was annoying. "The app doesn't calculate. It shouldn't."
- **Decisions (owner):**
  - **No estimates.** A thing has a date only when the user gives one. The FoodKeeper food types, the Tænk freezer check, the build script and its content files are removed (they stay in git history).
  - **One date, no kind.** The choice between "Bedst før" and "Sidste anvendelsesdato" is gone; the date is just "Dato".
  - **A month outside the fridge.** In a fridge place (kind Køl) the date is a day; elsewhere a month and a year, picked from two dropdowns (the same in every browser). A month is stored as its last day, with `datePrecision: 'month'`, and shown as "mar. 2027". A thing keeps how its date was given when it moves.
  - **"Brug snart" keeps its windows** (Køl 3 days, Tørvarer 14, Frost 30), counted to a month's last day.
  - **The top of a thing's sheet:** only the date, and once it has passed one warning: "Datoen er overskredet. Se, lugt og smag, før du bruger det. Kød, fisk og rester: smid det ud." Needs the owner's check of the wording.
  - **"Åbnet i dag" is gone**, and with it the opened and thawed clocks.
  - **"Sådan regner appen" is gone** (the page, its route and its links).
  - **Kinds of food ("Slags"):** 12 groups people recognise: Kød og fjerkræ, Fisk, Mejeri og æg, Frugt og grønt, Brød og kager, Pasta, ris og mel, Dåser og glas, Krydderier og saucer, Snacks og slik, Drikkevarer, Rester og færdigretter, Andet. They are guessed from whole words (the end of a Danish compound counts: rug|brød), or from Open Food Facts' categories. When nothing matches, the group is Andet, never a wrong guess. A test checks about 110 everyday names.
- **Old data:** read as before, with no database change. The package date becomes the date (as a day); `typeId`, `openedOn`, `thawedOn`, `packageKind` and `brand` are dropped; Fjerkræ becomes Kød og fjerkræ, and Frost is guessed again from the name.

## S-022: Easier adding, and Steder without a selector

- **Date:** 2026-11-25
- **Decisions (owner):**
  - **The place is a field at the top of the add form**, no longer a first step. It starts on the place you are on, else the last one used (`lastPlaceId`), else the first. Scanning has the same field in its sheet.
  - **Place choices:** buttons side by side up to three places, a dropdown above three. Used when adding, in "Flyt til" and when a place with things is deleted.
  - **Size:** a number with a unit dropdown in one field (stk., pk., ds., g, kg, ml, cl, dl, l). A unit typed with the number ("500 g", "2 dåser") moves to the dropdown. The size can now be changed in a thing's sheet.
  - **Names:** a capital first letter, and ALL CAPS as ordinary text, for typed and scanned names.
  - **Brands:** taken out of scanned names (the brands Open Food Facts lists, as whole words), so "Heinz Baked Beans" is "Baked Beans". Drinks keep their brand. If only the brand is left, Open Food Facts' generic name is used. Brands are no longer kept on things.
  - **The same thing is one line:** the same name (ignoring case and accents), size and place adds to the count; the earlier date stays.
  - **Steder:** "Slet sted" is now "Slet". There is no order selector: alphabetical until the user first drags a place or uses "Flyt op" / "Flyt ned", which makes the order their own; "Sortér alfabetisk" (shown only then) goes back.

## S-023: The look of Shelfwise, light only

- **Date:** 2026-11-25
- **Decision (owner):** Spisekammer takes the look of the owner's Shelfwise (github.com/illusive/shelfwise: `src/ui/tokens.css`, `docs/ui-guidelines.md`), with its own screens and no tab bar.
  - **Colours:** paper `#f5f4ee`, deep green `#173d32`, lime `#d8ed94`, muted `#68746c`, soft lines, and Shelfwise's warning and danger pairs.
  - **Light only (owner):** the dark tokens and the "Udseende" setting are gone.
  - **Type:** Manrope 500/600/700 and IBM Plex Mono for small counts, self-hosted (`@fontsource/manrope` and `@fontsource/ibm-plex-mono` 5.3.0, OFL-1.1). Fixed weights, because Playwright's WebKit drew the variable file at one thin weight. Nunito is gone.
  - **Parts:**
    - flat rows with dividers and a round icon bubble
    - deep-green primary buttons, with a lime arrow on the form's main one
    - outlined round icon buttons
    - a segmented choice
    - white fields with a line
    - paper sheets with a handle
    - a dark-green toast
  - `web/src/components/ui.tsx` no longer follows stead's.
- **Checked:** screenshots at iPhone size in WebKit, and the layout tests (sheet fit, tap targets, field heights, no sideways scroll) on every screen.

## S-024: The menu, asking where, search as a sheet, the month wheel, and a tidy-up

- **Date:** 2026-11-26
- **Decisions (owner):**
  - **Shelfwise's floating menu** on Hjem and a place's page: Tilføj · **Scan** (the big centre button) · Søg. Icon-only, labelled for VoiceOver. Hjem loses its search field and Scan/Tilføj buttons; a place's page keeps its own search.
  - **Asking where:** Scan and Tilføj ask "Hvor lægger du ting?" (one tap per place, the last used marked), and the place is preset in what follows, still changeable in the form. On a place's page, and with only one place, it does not ask.
  - **Søg** is a sheet over the page: the field takes focus, results come from every place, and a result opens the thing on top.
  - **The month wheel:** where the browser has a native month field (the iPhone, Android), it is used; elsewhere the two dropdowns stay.
  - **Grey group headings:** section titles are Shelfwise's small grey mono labels, with the count at the right. Things show their count at the right (Shelfwise's value column).
- **Added with them (proposed in the plan):**
  - **Undo:** deleting a thing happens at once, with "Fortryd" in the message for 6 seconds. The confirm question for a thing is gone (it said "cannot be undone"); places still ask.
  - **Barcode memory gaps fixed:** the size the user settled on is remembered (not the lookup's); a later group or size change updates the memory; a merge keeps the barcode; "Du har allerede" no longer acts silently in another place (it offers "Læg n i ‹the chosen place›", and names the other place on its buttons); a form filled from memory says so.
- **Tidy-up (from a code audit):**
  - shared `useToast`, `RowBody`/`LinkRow`/`ButtonRow`, `Notice`, `FieldLabel`, `Wordmark`, the `link`/`action` button looks
  - `components/sheet.tsx` and `Stepper.tsx` split from `ui.tsx`
  - `addThing`, `countsByPlace`/`totalCount`, `labelOf`, `isUrgent`
  - fewer prop-to-state effects
  - tokens for the field radius, shadows and the overlay
  - focus moves to a page's title when it opens
  - lists keep their list role in Safari
  - dead code removed: the install-progress messages, the unused update check, unused helpers and strings
- **Not checked:** on the owner's iPhone (the wheel, the menu above the home bar, scanning a known barcode). The "Du har allerede" choices are not covered by e2e, since a test cannot hand the scanner a barcode; the model under them is unit-tested.
