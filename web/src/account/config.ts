// The Supabase project (S-002, S-011): EU (eu-west-1). Only the project URL and the public anon key
// belong in the app (AGENTS.md); both are public by design, and the data is protected by row-level
// security (supabase/migrations). The anon key is filled in once the project is set up; until then
// the household screen says sharing is not set up, and everything else works as before.

export const SUPABASE_URL: string = 'https://vfenzvvexhwuuxiaexux.supabase.co';
export const SUPABASE_ANON_KEY: string = '';

export const accountsConfigured = SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '';
