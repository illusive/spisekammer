// The household schema and its row-level security (S-011), run against real Postgres (PGlite) with
// the migrations in supabase/migrations. Supabase's own pieces are stubbed the way Supabase sets
// them up: the anon and authenticated roles, auth.users, auth.uid() from the request's JWT, and
// default grants on new tables and functions (which the migration then narrows).

import { PGlite } from '@electric-sql/pglite';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const MIGRATIONS = join(__dirname, '..', '..', '..', 'supabase', 'migrations');

const SUPABASE_STUB = `
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
  grant usage on schema public to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant all on functions to anon, authenticated;
`;

const ANNA = '00000000-0000-4000-8000-00000000000a';
const BO = '00000000-0000-4000-8000-00000000000b';
const CARL = '00000000-0000-4000-8000-00000000000c';

let db: PGlite;

// Runs SQL as a signed-in user (or signed out with null), the way PostgREST does.
async function as<T = Record<string, unknown>>(user: string | null, sql: string, params: unknown[] = []): Promise<T[]> {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${user ?? ''}', false); set role ${user ? 'authenticated' : 'anon'};`);
  try {
    return (await db.query<T>(sql, params)).rows;
  } finally {
    await db.exec('reset role;');
  }
}

const fails = async (p: Promise<unknown>, message?: RegExp) => {
  let error: unknown = null;
  try {
    await p;
  } catch (e) {
    error = e;
  }
  expect(error, 'expected an error').not.toBeNull();
  if (message) expect(String((error as Error).message)).toMatch(message);
};

const item = (id: string, household: string) =>
  `insert into public.items (id, household_id, place_id, name, category, count, added_on, placed_on) values ('${id}', '${household}', 'freezer', 'Hakket oksekød', 'meat', 1, '2026-11-08', '2026-11-08')`;

beforeAll(async () => {
  db = new PGlite();
  await db.exec(SUPABASE_STUB);
  for (const file of readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql')).sort()) await db.exec(readFileSync(join(MIGRATIONS, file), 'utf8'));
  await db.exec(`insert into auth.users (id, email) values ('${ANNA}', 'anna@example.com'), ('${BO}', 'bo@example.com'), ('${CARL}', 'carl@example.com');`);
});

afterAll(async () => {
  await db.close();
});

beforeEach(async () => {
  await db.exec('reset role; delete from public.households;');
});

async function annasHousehold(): Promise<string> {
  const [row] = await as<{ id: string }>(ANNA, `select public.create_household('Hjemme') as id`);
  return row!.id;
}

describe('creating a household', () => {
  it('makes the user its owner and adds the three default places (S-013)', async () => {
    const hid = await annasHousehold();
    expect(await as(ANNA, 'select role, email from public.household_members')).toEqual([{ role: 'owner', email: 'anna@example.com' }]);
    expect(await as(ANNA, 'select id, kind, name from public.places order by sort')).toEqual([
      { id: 'freezer', kind: 'freezer', name: null },
      { id: 'pantry', kind: 'pantry', name: null },
      { id: 'larder', kind: 'pantry', name: null },
    ]);
    expect(await as(ANNA, 'select name from public.households')).toEqual([{ name: 'Hjemme' }]);
    expect(hid).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('needs a signed-in user, and only one household per user', async () => {
    await fails(as(null, `select public.create_household('X')`), /permission denied/);
    await annasHousehold();
    await fails(as(ANNA, `select public.create_household('Igen')`), /already_in_household/);
  });

  it('cannot be done by inserting rows directly', async () => {
    await fails(as(ANNA, `insert into public.households (name) values ('Snyd')`), /permission denied/);
  });
});

describe('invites and joining', () => {
  it('lets a member invite with a six-letter code, and another user join with it', async () => {
    const hid = await annasHousehold();
    const [{ code }] = (await as<{ code: string }>(ANNA, 'select public.create_invite($1) as code', [hid])) as [{ code: string }];
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);

    const [{ id }] = (await as<{ id: string }>(BO, 'select public.join_household($1) as id', [` ${code.toLowerCase().slice(0, 3)}-${code.slice(3)} `])) as [{ id: string }];
    expect(id).toBe(hid);
    expect((await as<{ email: string }>(BO, 'select email from public.household_members order by joined_at')).map((m) => m.email)).toEqual(['anna@example.com', 'bo@example.com']);
    expect(await as(BO, 'select role from public.household_members where user_id = $1', [BO])).toEqual([{ role: 'member' }]);
  });

  it('refuses an unknown or expired code, and a non-member inviting', async () => {
    const hid = await annasHousehold();
    await fails(as(BO, `select public.join_household('ZZZZZZ')`), /invite_not_found/);
    await fails(as(BO, 'select public.create_invite($1)', [hid]), /not_a_member/);
    const [{ code }] = (await as<{ code: string }>(ANNA, 'select public.create_invite($1) as code', [hid])) as [{ code: string }];
    await db.exec(`update public.invites set expires_at = now() - interval '1 minute' where code = '${code}'`);
    await fails(as(BO, 'select public.join_household($1)', [code]), /invite_not_found/);
  });

  it('refuses joining a second household', async () => {
    const hid = await annasHousehold();
    await as(BO, `select public.create_household('Bos')`);
    const [{ code }] = (await as<{ code: string }>(ANNA, 'select public.create_invite($1) as code', [hid])) as [{ code: string }];
    await fails(as(BO, 'select public.join_household($1)', [code]), /already_in_household/);
  });

  it('hides invites from outsiders', async () => {
    const hid = await annasHousehold();
    await as(ANNA, 'select public.create_invite($1)', [hid]);
    expect(await as(BO, 'select * from public.invites')).toEqual([]);
    expect(await as(ANNA, 'select household_id from public.invites')).toHaveLength(1);
  });
});

describe('what each user can see and change', () => {
  it('lets members add, rename and retire their own places', async () => {
    const hid = await annasHousehold();
    await as(ANNA, `insert into public.places (household_id, id, kind, name, sort) values ($1, 'garage', 'freezer', 'Fryser i garagen', 3)`, [hid]);
    expect(await as(ANNA, `update public.places set name = 'Garagen', kind = 'freezer' where id = 'garage' returning name`)).toEqual([{ name: 'Garagen' }]);
    expect(await as(ANNA, `update public.places set deleted_at = now() where id = 'garage' returning id`)).toHaveLength(1);
    await fails(as(ANNA, `insert into public.places (household_id, id, kind, sort) values ($1, 'cellar', 'cellar', 4)`, [hid]), /check constraint/);
    await fails(as(ANNA, `delete from public.places`), /permission denied/);
  });

  it('keeps households apart', async () => {
    const hid = await annasHousehold();
    await as(ANNA, item('10000000-0000-4000-8000-000000000001', hid));
    expect(await as(BO, 'select * from public.items')).toEqual([]);
    expect(await as(BO, 'select * from public.households')).toEqual([]);
    expect(await as(BO, 'select * from public.places')).toEqual([]);
    expect(await as(BO, 'select * from public.household_members')).toEqual([]);
    await fails(as(BO, item('10000000-0000-4000-8000-000000000002', hid)), /row-level security/);
    expect(await as(BO, `update public.items set count = 9 returning id`)).toEqual([]); // nothing visible to change
  });

  it('shows nothing to someone signed out', async () => {
    await annasHousehold();
    await fails(as(null, 'select * from public.households'), /permission denied/);
    await fails(as(null, 'select * from public.items'), /permission denied/);
  });

  it('lets members share items, stamped by the server, and never hard-delete them', async () => {
    const hid = await annasHousehold();
    const [{ code }] = (await as<{ code: string }>(ANNA, 'select public.create_invite($1) as code', [hid])) as [{ code: string }];
    await as(BO, 'select public.join_household($1)', [code]);

    await as(ANNA, item('10000000-0000-4000-8000-000000000003', hid));
    const [row] = await as<{ updated_by: string; updated_at: Date }>(BO, `update public.items set count = 2, updated_at = '2000-01-01', updated_by = '${CARL}' returning updated_by, updated_at`);
    expect(row?.updated_by).toBe(BO);
    expect(new Date(row!.updated_at).getFullYear()).toBeGreaterThan(2000);

    await fails(as(BO, 'delete from public.items'), /permission denied/);
    expect(await as(BO, `update public.items set deleted_at = now() returning id`)).toHaveLength(1); // a deletion marker
  });

  it('lets members rename the household, but nothing else about it', async () => {
    const hid = await annasHousehold();
    expect(await as(ANNA, `update public.households set name = 'Sommerhus' returning name`)).toEqual([{ name: 'Sommerhus' }]);
    await fails(as(ANNA, `update public.households set id = gen_random_uuid()`), /permission denied/);
    expect(await as(BO, `update public.households set name = 'Mit' where id = '${hid}' returning id`)).toEqual([]);
  });
});

describe('leaving', () => {
  it('passes ownership on, and the last one out deletes the household and its things', async () => {
    const hid = await annasHousehold();
    const [{ code }] = (await as<{ code: string }>(ANNA, 'select public.create_invite($1) as code', [hid])) as [{ code: string }];
    await as(BO, 'select public.join_household($1)', [code]);
    await as(ANNA, item('10000000-0000-4000-8000-000000000004', hid));

    await as(ANNA, 'select public.leave_household()');
    expect(await as(ANNA, 'select * from public.items')).toEqual([]);
    expect(await as(BO, 'select email, role from public.household_members')).toEqual([{ email: 'bo@example.com', role: 'owner' }]);

    await as(BO, 'select public.leave_household()');
    await db.exec('reset role;');
    expect((await db.query('select count(*)::int as n from public.households')).rows).toEqual([{ n: 0 }]);
    expect((await db.query('select count(*)::int as n from public.items')).rows).toEqual([{ n: 0 }]);
  });
});
