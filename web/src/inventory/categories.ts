// What kind of food a thing is ("Slags", S-021): a short list of groups people recognise, guessed
// from the name or from Open Food Facts' categories, always changeable. A guess has to be sure:
// a name it does not know is "Andet", never a wrong group. Pure, tested (categories.test.ts).

import { fold } from '../lib/fold';

export const CATEGORIES = ['meat', 'fish', 'dairy', 'produce', 'bread', 'dry', 'canned', 'spices', 'snacks', 'drinks', 'leftovers', 'other'] as const;
export type Category = (typeof CATEGORIES)[number];

// Records from before S-021 had more groups: poultry is meat now, and frozen is guessed again.
export function readCategory(value: unknown, name: string): Category {
  if (value === 'poultry') return 'meat';
  if (value === 'frozen') return guessCategory(name) ?? 'other';
  return CATEGORIES.find((c) => c === value) ?? 'other';
}

// Danish and English words, compared after folding (case and accents ignored).
// - "word": the whole word, or the end of a longer one (Danish puts the head last: rug|brød), or
//   the start of one when the word has 4+ letters (kylling|ebryst).
// - "=word": the whole word only (short words that hide in others: is, øl, te).
// - "two words": the phrase anywhere in the name.
const WORDS: [Category, string[]][] = [
  ['meat', ['kød', 'oksekød', 'svinekød', 'kalvekød', 'lammekød', 'hakkebøf', 'bøf', 'flæsk', 'flæskesteg', 'bacon', 'pølse', 'pølser', 'skinke', 'kotelet', 'koteletter', 'mørbrad', 'culotte', 'entrecote', 'frikadelle', 'frikadeller', 'medister', 'leverpostej', 'salami', 'kylling', 'kalkun', 'andebryst', 'andelår', '=and', 'lam', 'kalv', 'ribbensteg', 'beef', 'pork', 'mince', 'sausage', 'sausages', 'ham', 'chicken', 'turkey', 'lamb', 'meat', 'steak', 'duck']],
  ['fish', ['fisk', 'fiskefrikadeller', 'fiskefilet', 'laks', 'torsk', 'rejer', 'reje', 'tun', 'makrel', 'sild', 'rødspætte', 'kuller', 'sej', 'ørred', 'muslinger', 'krabbe', 'hummer', 'salmon', 'cod', 'fish', 'shrimp', 'prawns', 'tuna', 'mackerel', 'herring']],
  ['dairy', ['mælk', 'letmælk', 'minimælk', 'skummetmælk', 'sødmælk', 'kærnemælk', 'ost', 'smør', 'fløde', 'piskefløde', 'yoghurt', 'skyr', 'kvark', 'æg', 'creme fraiche', 'cremefraiche', 'mozzarella', 'parmesan', 'feta', 'cheddar', 'milk', 'cheese', 'butter', 'cream', 'egg', 'eggs', 'yogurt', 'yoghurt']],
  ['produce', ['frugt', 'grønt', 'grøntsager', 'æble', 'æbler', 'banan', 'bananer', 'pære', 'pærer', 'appelsin', 'appelsiner', 'citron', 'citroner', 'lime', 'gulerod', 'gulerødder', 'kartoffel', 'kartofler', 'løg', 'porre', 'salat', 'agurk', 'tomat', 'tomater', 'peberfrugt', 'broccoli', 'blomkål', 'kål', 'squash', 'aubergine', 'champignon', 'champignoner', 'svampe', 'spinat', 'bær', 'vindruer', 'druer', 'melon', 'avocado', 'ærter', 'majs', 'grønne bønner', 'apple', 'apples', 'banana', 'bananas', 'carrot', 'carrots', 'potato', 'potatoes', 'onion', 'onions', 'lettuce', 'cucumber', 'tomato', 'tomatoes', 'fruit', 'vegetables', 'berries', 'peas']],
  ['bread', ['brød', 'bolle', 'boller', 'rundstykke', 'rundstykker', 'toast', 'knækbrød', 'tortilla', 'tortillas', 'pita', 'flutes', 'baguette', 'kage', 'kager', 'croissant', 'croissanter', 'muffins', 'bread', 'bun', 'buns', 'cake', 'bagel', 'bagels']],
  ['dry', ['pasta', 'spaghetti', 'penne', 'makaroni', 'lasagneplader', 'nudler', '=ris', 'jasminris', 'basmatiris', 'grødris', '=mel', 'hvedemel', 'rugmel', 'havregryn', 'gryn', 'müsli', 'mysli', 'cornflakes', 'sukker', 'flormelis', 'bagepulver', 'linser', 'couscous', 'bulgur', 'quinoa', 'rosiner', 'rice', 'flour', 'oats', 'sugar', 'noodles', 'cereal', 'lentils']],
  ['canned', ['dåse', 'dåser', 'konserves', 'hakkede tomater', 'flåede tomater', 'tomatpuré', 'puré', 'bønner', 'kidneybønner', 'kikærter', 'baked beans', 'butter beans', 'syltetøj', 'marmelade', 'kokosmælk', 'oliven', 'pickles', 'rødbeder', 'beans', 'jam', 'canned', 'tinned', 'chickpeas']],
  ['spices', ['salt', 'peber', 'krydderi', 'krydderier', 'karry', 'paprika', 'kanel', 'oregano', 'timian', 'basilikum', 'bouillon', 'fond', 'sauce', 'ketchup', 'sennep', 'mayonnaise', 'remoulade', 'dressing', 'soja', 'sojasauce', 'eddike', 'olie', 'pesto', 'honning', 'sirup', 'spice', 'spices', 'pepper', 'oil', 'vinegar', 'mustard', 'stock', 'honey']],
  ['snacks', ['chips', 'slik', 'chokolade', 'kiks', 'småkager', 'lakrids', 'vingummi', 'popcorn', 'nødder', 'peanuts', 'jordnødder', 'mandler', 'karamel', 'karameller', '=is', 'flødeis', 'vaniljeis', 'ispind', 'sorbet', 'snacks', 'crisps', 'chocolate', 'sweets', 'candy', 'cookies', 'biscuits', 'nuts', 'ice cream']],
  ['drinks', ['juice', 'saft', 'sodavand', 'cola', '=øl', 'vin', 'vand', 'kaffe', '=te', 'smoothie', 'cider', 'beer', 'wine', 'water', 'coffee', 'tea', 'soda', 'lemonade']],
  ['leftovers', ['rester', '=rest', 'madpakke', 'færdigret', 'færdigretter', 'lasagne', 'suppe', 'gryderet', 'pizza', 'leftovers', 'soup', 'ready meal']],
];

// How a key matches: a phrase beats a whole word, which beats the end of a word, which beats the
// start; then the earlier word in the name ("Tun i vand"), then the longer key.
const PHRASE = 4;
const WHOLE = 3;
const END = 2;
const START = 1;

interface Hit {
  category: Category;
  rank: number;
  length: number;
  at: number;
}

const KEYS = WORDS.flatMap(([category, keys]) =>
  keys.map((raw) => {
    const exact = raw.startsWith('=');
    return { category, key: fold(exact ? raw.slice(1) : raw), exact };
  }),
);

function hitsIn(name: string): Hit[] {
  const text = fold(name);
  const words = text.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const hits: Hit[] = [];
  for (const { category, key, exact } of KEYS) {
    if (key.includes(' ')) {
      const at = text.indexOf(key);
      if (at >= 0) hits.push({ category, rank: PHRASE, length: key.length, at });
      continue;
    }
    words.forEach((w, at) => {
      if (w === key) hits.push({ category, rank: WHOLE, length: key.length, at });
      else if (exact) return;
      else if (key.length >= 3 && w.endsWith(key)) hits.push({ category, rank: END, length: key.length, at });
      else if (key.length >= 4 && w.startsWith(key)) hits.push({ category, rank: START, length: key.length, at });
    });
  }
  return hits;
}

export function guessCategory(name: string): Category | null {
  const best = hitsIn(name).sort((a, b) => b.rank - a.rank || a.at - b.at || b.length - a.length)[0];
  return best?.category ?? null;
}

// Open Food Facts category tags ("en:meats", "en:dairies" …), most specific checked first.
const OFF_TAGS: [Category, string[]][] = [
  ['drinks', ['en:beverages']],
  ['snacks', ['en:snacks', 'en:sweet-snacks', 'en:salty-snacks', 'en:chocolates', 'en:confectioneries', 'en:ice-creams']],
  ['spices', ['en:condiments', 'en:sauces', 'en:spices', 'en:vegetable-oils', 'en:vinegars']],
  ['fish', ['en:fishes', 'en:seafood', 'en:fish-and-seafood']],
  ['meat', ['en:meats', 'en:sausages', 'en:hams', 'en:poultries', 'en:chickens', 'en:chicken-meats']],
  ['dairy', ['en:dairies', 'en:cheeses', 'en:milks', 'en:yogurts', 'en:butters', 'en:eggs']],
  ['canned', ['en:canned-foods', 'en:jams']],
  ['bread', ['en:breads', 'en:crispbreads', 'en:cakes']],
  ['dry', ['en:pastas', 'en:rices', 'en:flours', 'en:breakfast-cereals', 'en:cereals-and-potatoes']],
  ['produce', ['en:fresh-fruits', 'en:fresh-vegetables', 'en:fruits', 'en:vegetables']],
  ['leftovers', ['en:meals', 'en:soups', 'en:pizzas']],
];

export function categoryFromTags(tags: string[]): Category | null {
  for (const [category, keys] of OFF_TAGS) if (keys.some((k) => tags.includes(k))) return category;
  return null;
}
