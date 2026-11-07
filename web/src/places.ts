// The places things are kept (S-002). A new household starts with these three; its own places
// come in slice 2. The kind decides which keeping times apply (slice 3).

export type PlaceKind = 'fridge' | 'freezer' | 'pantry';

export interface Place {
  id: string;
  kind: PlaceKind;
}

export const DEFAULT_PLACES: Place[] = [
  { id: 'fridge', kind: 'fridge' },
  { id: 'freezer', kind: 'freezer' },
  { id: 'pantry', kind: 'pantry' },
];
