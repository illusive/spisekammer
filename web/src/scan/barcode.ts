// Barcode lookup (from stead's D-047; S-004 here): only the barcode is sent, to Open Food Facts
// (open data, ODbL), and only after the user scans; without a connection, or if the product is
// unknown, the user types the name and the barcode is remembered on this phone with it. The answer is
// kept on this phone only, never in the shared catalogue (S-004). Parsing is pure, for tests.

import { parseSize, SIZE_UNITS, sizeText } from '../inventory/size';

export const OFF_ATTRIBUTION = 'Open Food Facts';
export const OFF_URL = 'https://world.openfoodfacts.org';
const TIMEOUT_MS = 6000;

// What Open Food Facts says about a barcode: name, brand, size, and its category tags (for a
// first guess of the category, inventory/categories.ts).
export interface FoundProduct {
  name: string;
  brand?: string;
  quantity?: string;
  tags: string[];
}

export const isBarcode = (code: string) => /^\d{8,14}$/.test(code);

// The frame on the camera picture, as shares of the camera view (D-055): only what is inside it
// (with a margin) is read, at the camera's full resolution.
export const SCAN_FRAME = { x: 0.12, y: 0.36, w: 0.76, h: 0.28 };
const FRAME_MARGIN = 0.15; // of the frame's size, on each side

// The part of the video under a box in the view, in video pixels. The video fills the view like
// CSS object-fit: cover (scaled up until both sides are covered, centred, the rest cut off).
export function cropFor(videoW: number, videoH: number, viewW: number, viewH: number, box = SCAN_FRAME, margin = FRAME_MARGIN): { x: number; y: number; w: number; h: number } {
  const scale = Math.max(viewW / videoW, viewH / videoH);
  const offsetX = (viewW - videoW * scale) / 2;
  const offsetY = (viewH - videoH * scale) / 2;
  const left = (box.x - box.w * margin) * viewW;
  const top = (box.y - box.h * margin) * viewH;
  const right = (box.x + box.w * (1 + margin)) * viewW;
  const bottom = (box.y + box.h * (1 + margin)) * viewH;
  const toX = (px: number) => Math.min(videoW, Math.max(0, (px - offsetX) / scale));
  const toY = (py: number) => Math.min(videoH, Math.max(0, (py - offsetY) / scale));
  const x = Math.round(toX(left));
  const y = Math.round(toY(top));
  return { x, y, w: Math.round(toX(right)) - x, h: Math.round(toY(bottom)) - y };
}

// Scanning goes on until the user is done (D-053), so the pack just added is usually still in
// front of the camera: its code is ignored for a moment after the camera resumes.
export const SAME_CODE_PAUSE_MS = 3000;
export function acceptCode(code: string, last: { code: string; at: number } | null, now: number): boolean {
  return !last || code !== last.code || now - last.at >= SAME_CODE_PAUSE_MS;
}

// Name, brand and size of a product in an Open Food Facts answer; the category is guessed from the
// name in the form, like a typed name.
export function parseProduct(json: unknown): FoundProduct | null {
  if (typeof json !== 'object' || json === null) return null;
  const { status, product } = json as { status?: unknown; product?: Record<string, unknown> };
  if (status !== 1 || typeof product !== 'object' || product === null) return null;
  const text = (x: unknown, max = 200) => (typeof x === 'string' && x.trim() ? x.trim().slice(0, max) : undefined);
  const name = text(product.product_name_da) ?? text(product.product_name);
  if (!name) return null;
  const brand = text(product.brands)?.split(',')[0]?.trim();
  // The size text ("6 x 1,5 l") keeps a multipack; Open Food Facts' own number and unit are the
  // fallback when the text cannot be read (D-050).
  const given = text(product.quantity, 40);
  const n = typeof product.product_quantity === 'string' ? Number(product.product_quantity) : product.product_quantity;
  const unit = SIZE_UNITS.find((u) => u === text(product.product_quantity_unit)?.toLowerCase());
  const quantity = given && parseSize(given) ? given : typeof n === 'number' && n > 0 && unit ? sizeText({ amount: n, unit }) : given;
  const tags = Array.isArray(product.categories_tags) ? product.categories_tags.filter((t): t is string => typeof t === 'string').slice(0, 40) : [];
  return { name, ...(brand ? { brand } : {}), ...(quantity ? { quantity } : {}), tags };
}

export type Lookup = { kind: 'found'; product: FoundProduct } | { kind: 'notFound' } | { kind: 'offline' };

export async function lookUp(code: string): Promise<Lookup> {
  if (!isBarcode(code)) return { kind: 'notFound' };
  if (!navigator.onLine) return { kind: 'offline' };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = `${OFF_URL}/api/v2/product/${code}.json?fields=product_name,product_name_da,brands,quantity,product_quantity,product_quantity_unit,categories_tags`;
    const response = await fetch(url, { signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store' });
    if (response.status === 404) return { kind: 'notFound' };
    if (!response.ok) return { kind: 'offline' };
    const product = parseProduct(await response.json());
    return product ? { kind: 'found', product } : { kind: 'notFound' };
  } catch {
    return { kind: 'offline' }; // no connection, timeout or a blocked request
  } finally {
    clearTimeout(timer);
  }
}
