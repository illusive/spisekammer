// The Supabase project (S-002, S-011): EU (eu-west-1). Only the project URL and the public key
// belong in the app (AGENTS.md); both are public by design, and the data is protected by row-level
// security (supabase/migrations). The key is Supabase's "publishable" key (sb_publishable_…), which
// replaces the older "anon" key. Without a key, the household screen says sharing is not set up,
// and everything else works as before.

export const SUPABASE_URL: string = 'https://vfenzvvexhwuuxiaexux.supabase.co';
export const SUPABASE_ANON_KEY: string = 'sb_publishable_0y2nYTeJzc01gQOzkJ-UJg_szM118uu';

export const accountsConfigured = SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '';
