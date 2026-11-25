// Names as people write them (S-022): a capital first letter, ALL CAPS turned into ordinary text,
// and, for scanned products, the brand taken out ("Heinz Baked Beans" → "Baked beans"), so the same
// food from two brands is one line. Drinks keep their brand: there it is what tells them apart.
// Pure, tested (name.test.ts).

const LETTER = /\p{L}/u;

export function tidyName(name: string): string {
  const text = name.replace(/\s+/g, ' ').trim();
  const letters = [...text].filter((c) => LETTER.test(c));
  const shouting = letters.length > 1 && letters.every((c) => c === c.toLocaleUpperCase('da') && c !== c.toLocaleLowerCase('da'));
  const base = shouting ? text.toLocaleLowerCase('da') : text;
  // Only a name that starts with a letter: "7up" stays as it is.
  if (!LETTER.test(base.charAt(0))) return base;
  return base.charAt(0).toLocaleUpperCase('da') + base.slice(1);
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// The name without the brands Open Food Facts lists for it ("Heinz, Kraft Heinz"), as whole
// words, ignoring case. Null when nothing but the brand is left.
export function stripBrand(name: string, brands: string | undefined): string | null {
  let text = name;
  const list = (brands ?? '')
    .split(',')
    .map((b) => b.trim())
    .filter((b) => b.length > 1)
    .sort((a, b) => b.length - a.length); // "Kraft Heinz" before "Heinz"
  for (const brand of list) {
    const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])${escape(brand)}(?:'s|’s)?(?=$|[^\\p{L}\\p{N}])`, 'giu');
    text = text.replace(pattern, '$1');
  }
  text = text
    .replace(/\s+/g, ' ')
    .replace(/^[\s\-–—,.:;·|&]+|[\s\-–—,.:;·|&]+$/g, '')
    .trim();
  return LETTER.test(text) ? text : null;
}
