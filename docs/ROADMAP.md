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
3. **Keeping times:**
   - the food types from FoodKeeper with Danish names (the 101 produce names from stead)
   - the rules engine with tests (chicken in the freezer, mince in the fridge when the fridge is on, opened jam, milk with a use-by date, out of the freezer)
   - package dates, opened and frozen
   - "Brug snart"
   - a "Sådan regner appen" page
4. **Accounts and households:** Supabase migrations in `supabase/`, RLS, email-code sign-in, invites, places per household.
5. **Sync:** the outbox, pulls, Realtime, count operations, deletion markers; tests with two clients.
6. **Shared catalogue:** saving typed products, filling in from them, reporting a wrong one, an optional "Tilføj til Open Food Facts".
7. **Ready to share:**
   - a privacy page
   - export and deleting the account
   - real icons and a final name
   - an accessibility pass
   - iPhone checks: offline in a shop, the camera, the email code in the installed app, two phones syncing
