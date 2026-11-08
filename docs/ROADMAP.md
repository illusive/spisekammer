# Roadmap

Each slice builds, is tested, and works on its own.

1. **Scaffold** (S-001), **done 2026-11-07:**
   - the repo and docs
   - the stack copied from stead
   - the friendly tokens and Nunito
   - Home, Place and Settings screens (no inventory yet)
   - the service worker and update banner
   - the CI workflow

   **Not yet:** real app icons (an SVG placeholder for now). The repo and Pages deployment were set up the same day.
2. **Local inventory** (S-006), **done 2026-11-07:**
   - IndexedDB through `idb`
   - the three places, the overview by place, then category
   - add, take, move and delete with the sheets
   - the category guess and the default place
   - the scanner and the Open Food Facts lookup (from stead)
   - search across everything

   **Checked in the preview:** adding (the guess, the place), moving, taking the last one out, delete with confirm, search, a reload, typing on the scan screen without a camera, dark mode.
   **Not yet:** Playwright e2e tests run offline; the camera and "Du har allerede" with a real barcode (on an iPhone).

   **Then (S-007):** the fridge is optional and off by default, a choice in Indstillinger.
3. **Keeping times** (S-009, S-010), **done 2026-11-07:**
   - 409 food types from FoodKeeper (101 produce names from stead, 308 drafted)
   - the rules engine with tests (chicken in the freezer, mince in the fridge, opened jam, milk with a date, out of the freezer, and a use-by sweep over all types)
   - the type guessed from the name, package dates, "Åbnet i dag", moves restarting the clock
   - "Brug snart" on Home, the keep-by line in every list
   - a "Sådan regner appen" page

   **Checked in the preview:** adding with the guessed type and a live date, the package date and its kind, "Brug snart", "Åbnet i dag" and undo, the rules page.
   **Not yet:** the owner's check of the drafted names and keys (`docs/FOOD_TYPES_REVIEW.md`); a Danish check of the most common times (`docs/OPEN_QUESTIONS.md`); Playwright e2e tests.
4. **Accounts and households** (S-011), **built 2026-11-08:**
   - the schema with row-level security and its functions (`supabase/migrations/`), 12 tests on real Postgres (PGlite)
   - sign-in with an email code, create or join a household, invite with a link and a code, leave, sign out
   - "Husstand" in Indstillinger; the Supabase library loads only there

   **Checked in the preview:** the Husstand row, an invite link opening the screen, "not set up" without a key, the sign-in form.
   **Then (S-012):** the sign-in link in the email works too, for trying it out with Supabase's built-in email.
   **Not yet:** applying the migration to the project, the email template, the anon key and custom SMTP (`supabase/README.md`); sign-in and invites end to end; the fridge setting moving from the phone to the household (slice 5).
5. **Sync:** the outbox, pulls, Realtime, count operations, deletion markers; tests with two clients.
6. **Shared catalogue:** saving typed products, filling in from them, reporting a wrong one, an optional "Tilføj til Open Food Facts".
7. **Ready to share:**
   - a privacy page
   - export and deleting the account
   - real icons and a final name
   - an accessibility pass
   - iPhone checks: offline in a shop, the camera, the email code in the installed app, two phones syncing
