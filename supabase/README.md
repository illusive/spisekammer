# Supabase

The project: `vfenzvvexhwuuxiaexux`, region eu-west-1 (S-002). The schema and its row-level security are in `migrations/` and are tested against real Postgres (PGlite) by `web/src/account/schema.test.ts`.

**Secrets:** the app holds only the project URL and the public anon key (`web/src/account/config.ts`). The database password and the service-role key never go in the repo. Keep them in a git-ignored `.env` in this folder if a tool needs them.

## Setting up the project (once)

1. **Apply the migration.** Either paste `migrations/20261108000000_households.sql` into the SQL editor and run it, or from the repo root:

   ```
   npx supabase db push --db-url "postgresql://postgres.vfenzvvexhwuuxiaexux:<password>@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
   ```

2. **Sign-in by code, not link** (Authentication → Email Templates). In both **Magic Link** and **Confirm signup**, show the code instead of the link. Suggested text:

   > Subject: Din kode til Spisekammer
   >
   > Din kode er **{{ .Token }}**. Den virker i en time. Har du ikke bedt om den, kan du se bort fra denne mail.

3. **Email provider** (Authentication → Sign In / Providers → Email): enabled, "Confirm email" on. The code is 6 digits and expires after 3600 seconds.

4. **Site URL** (Authentication → URL Configuration): `https://illusive.github.io/spisekammer/`.

5. **Email sending.** Supabase's built-in email service is for trying things out: it sends only a few emails an hour and may only send to the project's team members. Set up custom SMTP (an EU provider) before inviting anyone outside the team (`docs/OPEN_QUESTIONS.md`).

6. **The anon key** (Project Settings → API → the `anon` / publishable key) goes into `web/src/account/config.ts`. It is public by design; row-level security protects the data.

## Changing the schema

Add a new file in `migrations/` (never edit an applied one), extend `schema.test.ts`, and apply it as in step 1.
