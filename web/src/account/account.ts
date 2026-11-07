// Signing in and the household (S-011), on Supabase. Loaded only with the household screen, so the
// rest of the app neither downloads nor needs it. The session is kept on the phone by supabase-js
// (localStorage, 'spisekammer.auth') and refreshed while online.
//
// Sign-in is a 6-digit code by email, not a magic link: a link would open Safari instead of the
// installed app on an iPhone (S-002).

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

let client: SupabaseClient | null = null;
function supabase(): SupabaseClient {
  client ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'spisekammer.auth' },
  });
  return client;
}

export interface Member {
  userId: string;
  email: string;
  role: 'owner' | 'member';
}

export interface Household {
  id: string;
  name: string;
  fridge: boolean;
  members: Member[];
}

export type Account = { status: 'signedOut' } | { status: 'signedIn'; userId: string; email: string; household: Household | null };

export async function loadAccount(): Promise<Account> {
  const { data } = await supabase().auth.getSession();
  const user = data.session?.user;
  if (!user) return { status: 'signedOut' };
  // Row-level security returns only the user's own household's members.
  const members = await supabase().from('household_members').select('household_id, user_id, role, email').order('joined_at');
  if (members.error) throw members.error;
  const first = members.data[0];
  if (!first) return { status: 'signedIn', userId: user.id, email: user.email ?? '', household: null };
  const household = await supabase().from('households').select('id, name, fridge').eq('id', first.household_id).single();
  if (household.error) throw household.error;
  return {
    status: 'signedIn',
    userId: user.id,
    email: user.email ?? '',
    household: {
      id: household.data.id as string,
      name: household.data.name as string,
      fridge: household.data.fridge as boolean,
      members: members.data.map((m) => ({ userId: m.user_id as string, email: m.email as string, role: m.role === 'owner' ? 'owner' : 'member' })),
    },
  };
}

async function check<T>(p: PromiseLike<{ data: T; error: unknown }>): Promise<T> {
  const { data, error } = await p;
  if (error) throw error;
  return data;
}

export const sendCode = (email: string) => check(supabase().auth.signInWithOtp({ email, options: { shouldCreateUser: true } }));
export const verifyCode = (email: string, token: string) => check(supabase().auth.verifyOtp({ email, token, type: 'email' }));
export const signOut = () => supabase().auth.signOut({ scope: 'local' });

export const createHousehold = (name: string) => check(supabase().rpc('create_household', { household_name: name }));
export const createInvite = (householdId: string) => check(supabase().rpc('create_invite', { hid: householdId })) as Promise<string>;
export const joinHousehold = (code: string) => check(supabase().rpc('join_household', { invite_code: code }));
export const leaveHousehold = () => check(supabase().rpc('leave_household'));

export type AccountError = 'offline' | 'invalidCode' | 'rateLimit' | 'inviteNotFound' | 'alreadyInHousehold' | 'invalidEmail' | 'unknown';

// What went wrong, in the words the screen has for it. The database functions raise named errors
// (supabase/migrations); Supabase Auth has its own codes.
export function accountError(error: unknown): AccountError {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'offline';
  const e = (error ?? {}) as { message?: string; code?: string; status?: number; name?: string };
  const text = `${e.code ?? ''} ${e.message ?? ''}`;
  if (/invite_not_found/.test(text)) return 'inviteNotFound';
  if (/already_in_household/.test(text)) return 'alreadyInHousehold';
  if (/otp_expired|invalid.*(otp|token)|token.*(expired|invalid)/i.test(text)) return 'invalidCode';
  if (e.status === 429 || /rate.?limit|over_email_send_rate_limit|too many/i.test(text)) return 'rateLimit';
  if (/email_address_invalid|invalid.*email|validation_failed/i.test(text)) return 'invalidEmail';
  if (e.name === 'AuthRetryableFetchError' || /fetch|network/i.test(text)) return 'offline';
  return 'unknown';
}
