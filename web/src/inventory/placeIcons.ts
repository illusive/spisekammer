// One icon per kind of place (S-013), used on Hjem and in Steder.
import { Archive, Refrigerator, Snowflake, type LucideIcon } from 'lucide-react';
import type { PlaceKind } from '../places';

export const PLACE_ICON: Record<PlaceKind, LucideIcon> = { fridge: Refrigerator, freezer: Snowflake, pantry: Archive };
