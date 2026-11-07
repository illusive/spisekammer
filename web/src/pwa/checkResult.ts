// The outcome of "Søg efter ny version" (D-065). Pure, for tests.

export type CheckResult = 'offline' | 'latest' | 'found' | 'failed';

// After registration.update(): a version being installed or waiting means a new one was found.
export function resultOf(registration: { installing: unknown; waiting: unknown }): CheckResult {
  return registration.installing || registration.waiting ? 'found' : 'latest';
}
