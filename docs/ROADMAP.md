# Roadmap

Each slice builds, is tested, and works on its own.

1. **Scaffold** (S-001), **done 2026-11-07:**
   - the repo and docs
   - the stack copied from stead
   - the friendly tokens and Nunito
   - Home, Place and Settings screens (no inventory yet)
   - the service worker and update banner
   - the CI workflow

   **Not yet:** the GitHub repo, the deployment, real app icons (an SVG placeholder for now).
2. **Local inventory:** IndexedDB; places; add, take, move and delete with the sheets; the scanner and the Open Food Facts lookup (from stead); search across everything; the overview by place and category. No account. Playwright e2e tests, run offline.
3. **Keeping times:**
   - the food types from FoodKeeper with Danish names (the 101 produce names from stead)
   - the rules engine with tests (chicken in the freezer, mince in the fridge, opened jam, milk with a use-by date, thawing)
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
