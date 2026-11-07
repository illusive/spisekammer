// Builds web/src/keeping/food-types.json from the FoodKeeper snapshot (CC0) and our curated lists
// (S-009). Run: npm run build:food-types. It refuses to write when the snapshot's checksum is wrong,
// a FoodKeeper ID is unknown, a type has no times, a value is not understood, or two types share a
// key, so a mistake cannot slip into the app.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const SNAPSHOT = join(root, 'content', 'sources', 'foodkeeper-v128.json');
const SNAPSHOT_SHA256 = '037df0d301126acd8a48824506f04d49d8be1a1144b81fa69e4170228dc2e91a';
const LISTS = [join(root, 'content', 'food-types.json'), join(root, 'content', 'food-types-produce.json')];
const OUT = join(root, 'web', 'src', 'keeping', 'food-types.json');

const CATEGORIES = ['meat', 'poultry', 'fish', 'dairy', 'produce', 'bread', 'dry', 'canned', 'drinks', 'leftovers', 'frozen', 'other'];

type Unit = 'hours' | 'days' | 'weeks' | 'months' | 'years';
type Span = { min: number; max: number; unit: Unit };
type Time = Span | 'notRecommended' | 'indefinitely' | 'useBy' | 'whenRipe';
type Row = Record<string, unknown>;

const UNITS: Record<string, Unit> = { Hours: 'hours', Days: 'days', Weeks: 'weeks', Months: 'months', Year: 'years', Years: 'years' };
const SPECIAL: Record<string, Time> = { 'Not Recommended': 'notRecommended', Indefinitely: 'indefinitely', 'When Ripe': 'whenRipe', 'Package use-by date': 'useBy' };
const DAYS: Record<Unit, number> = { hours: 1 / 24, days: 1, weeks: 7, months: 30, years: 365 };

// Each time we use, and the FoodKeeper columns it is read from. "DOP_" columns count from the day
// of purchase; the plain ones say nothing about the start. Both mean "from the day it came there".
const FIELDS: [string, string[]][] = [
  ['pantry', ['DOP_Pantry', 'Pantry']],
  ['pantryOpened', ['Pantry_After_Opening']],
  ['fridge', ['DOP_Refrigerate', 'Refrigerate']],
  ['fridgeOpened', ['Refrigerate_After_Opening']],
  ['fridgeThawed', ['Refrigerate_After_Thawing']],
  ['freezer', ['DOP_Freeze', 'Freeze']],
];

const num = (v: unknown): number | undefined => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
const text = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined);

function duration(row: Row, prefix: string, context: string): Time | undefined {
  const metric = text(row[`${prefix}_Metric`]);
  const lo = num(row[`${prefix}_Min`]);
  const hi = num(row[`${prefix}_Max`]);
  if (metric === undefined) {
    if (lo !== undefined || hi !== undefined) throw new Error(`${context} ${prefix}: a number without a unit`);
    return undefined;
  }
  const special = SPECIAL[metric];
  if (special) return special;
  const unit = UNITS[metric];
  if (!unit) throw new Error(`${context} ${prefix}: unknown unit "${metric}"`);
  const min = lo ?? hi;
  const max = hi ?? lo;
  if (min === undefined || max === undefined) throw new Error(`${context} ${prefix}: a unit without numbers`);
  if (min > max) throw new Error(`${context} ${prefix}: min ${min} > max ${max}`);
  return { min, max, unit };
}

// When two columns give a time for the same place, the cautious one wins: "not recommended" over
// anything, a span over a word, the shorter span over the longer.
function cautious(a: Time | undefined, b: Time | undefined): Time | undefined {
  if (!a || !b) return a ?? b;
  if (a === 'notRecommended' || b === 'notRecommended') return 'notRecommended';
  if (typeof a === 'object' && typeof b === 'object') return a.min * DAYS[a.unit] <= b.min * DAYS[b.unit] ? a : b;
  if (typeof a === 'object') return a;
  if (typeof b === 'object') return b;
  return a === 'useBy' || b === 'useBy' ? 'useBy' : a;
}

const STOPWORDS = new Set(['på', 'i', 'og', 'af', 'til', 'of', 'in', 'and']);
const fold = (s: string) => s.toLocaleLowerCase('da').normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC');

function main() {
  const raw = readFileSync(SNAPSHOT);
  const sha = createHash('sha256').update(raw).digest('hex');
  if (sha !== SNAPSHOT_SHA256) throw new Error(`FoodKeeper snapshot checksum ${sha} is not the recorded one`);
  const data = JSON.parse(raw.toString('utf8')) as { sheets: { name: string; data: Row[][] }[] };
  const sheet = (name: string): Row[] => {
    const s = data.sheets.find((x) => x.name === name);
    if (!s) throw new Error(`FoodKeeper sheet missing: ${name}`);
    return s.data.map((cells) => Object.assign({}, ...cells) as Row);
  };
  const products = new Map(sheet('Product').map((p) => [num(p['ID']), p]));
  const current = sheet('Version').find((v) => v['Current_Version'] === 'Yes');
  const version = `${num(current?.['Data_Version_Number'])} (${text(current?.['Modified_Date']) ?? '?'})`;

  const seenFk = new Set<number>();
  const keyOwner = new Map<string, string>();
  const problems: string[] = [];
  const types = [];
  for (const file of LISTS) {
    const list = JSON.parse(readFileSync(file, 'utf8')) as { types: { fk: number; category: string; da: string; en: string; checked?: boolean; keys: string[] }[] };
    for (const entry of list.types) {
      const context = `FoodKeeper ${entry.fk} (${entry.da})`;
      const row = products.get(entry.fk);
      if (!row) throw new Error(`${context}: no such record`);
      if (seenFk.has(entry.fk)) throw new Error(`${context}: listed twice`);
      seenFk.add(entry.fk);
      if (!CATEGORIES.includes(entry.category)) throw new Error(`${context}: unknown category ${entry.category}`);
      if (!entry.da.trim() || !entry.en.trim() || entry.keys.length === 0) throw new Error(`${context}: a name or keys missing`);

      const times: Record<string, Time> = {};
      for (const [key, columns] of FIELDS) {
        let time: Time | undefined;
        for (const c of columns) time = cautious(time, duration(row, c, context));
        if (time) times[key] = time;
      }
      if (Object.keys(times).length === 0) throw new Error(`${context}: no keeping times`);

      for (const k of entry.keys) {
        const folded = fold(k.trim());
        const owner = keyOwner.get(folded);
        if (owner) problems.push(`Key "${k}" is used by both ${owner} and ${context}`);
        keyOwner.set(folded, context);
        for (const w of folded.replace(/^=/, '').split(' ')) if (!w) throw new Error(`${context}: empty word in key "${k}"`);
        if (folded.startsWith('=') && folded.includes(' ')) throw new Error(`${context}: "=" is for one word ("${k}")`);
        if (!folded.startsWith('=') && folded.split(' ').every((w) => STOPWORDS.has(w))) throw new Error(`${context}: key "${k}" has only small words`);
      }

      types.push({ id: `fk-${entry.fk}`, fk: entry.fk, category: entry.category, da: entry.da, en: entry.en, checked: entry.checked === true, keys: entry.keys, times });
    }
  }

  if (problems.length > 0) throw new Error(`${problems.length} problems:\n${problems.join('\n')}`);

  const out = {
    source: {
      id: 'us-fsis-foodkeeper',
      title: 'FoodKeeper Data',
      publisher: 'U.S. Department of Agriculture, Food Safety and Inspection Service',
      license: 'CC0-1.0',
      version,
      sha256: sha,
      url: 'https://catalog.data.gov/dataset/fsis-foodkeeper-data',
    },
    types,
  };
  writeFileSync(OUT, JSON.stringify(out, null, 0) + '\n');
  console.log(`${types.length} food types (FoodKeeper ${version}) → ${OUT}`);
}

main();
