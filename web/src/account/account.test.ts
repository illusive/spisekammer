import { describe, expect, it } from 'vitest';
import { accountError } from './account';

describe('account errors in the screen\'s words', () => {
  it('names the database functions\' errors', () => {
    expect(accountError({ message: 'invite_not_found' })).toBe('inviteNotFound');
    expect(accountError({ message: 'already_in_household' })).toBe('alreadyInHousehold');
  });
  it('names Supabase Auth\'s errors', () => {
    expect(accountError({ code: 'otp_expired', message: 'Token has expired or is invalid' })).toBe('invalidCode');
    expect(accountError({ code: 'over_email_send_rate_limit', status: 429 })).toBe('rateLimit');
    expect(accountError({ code: 'email_address_invalid' })).toBe('invalidEmail');
    expect(accountError({ name: 'AuthRetryableFetchError', message: 'Failed to fetch' })).toBe('offline');
  });
  it('falls back to "something went wrong"', () => {
    expect(accountError({ message: 'boom' })).toBe('unknown');
    expect(accountError(null)).toBe('unknown');
  });
});
