-- Households, members, invites, places and items (S-002, S-011).
--
-- Everything belongs to a household. Row-level security lets a signed-in user see and change only
-- the rows of the household they belong to. Creating a household, inviting, joining and leaving go
-- through the functions at the end, which check the rules in one place; the tables accept no direct
-- inserts or deletes for those.
--
-- One household per user in v1. Items are here so the rules cover them from the start; the app
-- syncs them from slice 5 (outbox, count operations, deletion markers).

-- ---------------------------------------------------------------- tables

create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  fridge boolean not null default false, -- the fridge is a place in the app (S-007)
  created_at timestamptz not null default now()
);

create table public.household_members (
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  email text not null, -- shown to the other members, so they know who is in
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);
create unique index household_members_one_per_user on public.household_members (user_id);

create table public.invites (
  code text primary key check (code ~ '^[A-HJ-NP-Z2-9]{6}$'),
  household_id uuid not null references public.households (id) on delete cascade,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index invites_household on public.invites (household_id);

create table public.places (
  household_id uuid not null references public.households (id) on delete cascade,
  id text not null check (char_length(id) between 1 and 64),
  kind text not null check (kind in ('fridge', 'freezer', 'pantry', 'other')),
  name text check (name is null or char_length(name) between 1 and 40), -- null: the kind's name
  sort integer not null default 0,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (household_id, id)
);

create table public.items (
  id uuid primary key,
  household_id uuid not null references public.households (id) on delete cascade,
  place_id text not null,
  name text not null check (char_length(name) between 1 and 120),
  brand text check (brand is null or char_length(brand) <= 120),
  category text not null,
  type_id text check (type_id is null or type_id ~ '^fk-[0-9]{1,4}$'),
  count integer not null check (count between 0 and 999),
  amount numeric check (amount is null or amount > 0),
  unit text,
  size_text text check (size_text is null or char_length(size_text) <= 40),
  barcode text check (barcode is null or barcode ~ '^[0-9]{8,14}$'),
  added_on date not null,
  placed_on date not null,
  opened_on date,
  thawed_on date,
  package_date date,
  package_kind text check (package_kind is null or package_kind in ('useBy', 'bestBefore')),
  updated_at timestamptz not null default now(), -- set by the server (trigger): last change wins
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz -- a deletion marker; it wins over edits (slice 5)
);
create index items_household_updated on public.items (household_id, updated_at);

-- ---------------------------------------------------------------- helpers

-- Whether the signed-in user belongs to the household. Security definer, so the policies below can
-- use it without the member table's own policy calling itself.
create function public.is_member(hid uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.household_members m where m.household_id = hid and m.user_id = auth.uid());
$$;

-- The server's clock and the user decide updated_at and updated_by, not the phone.
create function public.stamp_change() returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  if tg_table_name = 'items' then new.updated_by := auth.uid(); end if;
  return new;
end;
$$;
create trigger items_stamp before insert or update on public.items for each row execute function public.stamp_change();
create trigger places_stamp before insert or update on public.places for each row execute function public.stamp_change();

-- ---------------------------------------------------------------- row-level security

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.invites enable row level security;
alter table public.places enable row level security;
alter table public.items enable row level security;

create policy "members read their household" on public.households for select to authenticated using (public.is_member(id));
create policy "members rename their household" on public.households for update to authenticated using (public.is_member(id)) with check (public.is_member(id));

create policy "members see each other" on public.household_members for select to authenticated using (public.is_member(household_id));

create policy "members see invites" on public.invites for select to authenticated using (public.is_member(household_id));
create policy "members withdraw invites" on public.invites for delete to authenticated using (public.is_member(household_id));

create policy "members read places" on public.places for select to authenticated using (public.is_member(household_id));
create policy "members add places" on public.places for insert to authenticated with check (public.is_member(household_id));
create policy "members change places" on public.places for update to authenticated using (public.is_member(household_id)) with check (public.is_member(household_id));

create policy "members read items" on public.items for select to authenticated using (public.is_member(household_id));
create policy "members add items" on public.items for insert to authenticated with check (public.is_member(household_id));
create policy "members change items" on public.items for update to authenticated using (public.is_member(household_id)) with check (public.is_member(household_id));

-- No one signed out reads or writes anything; signed-in users only what the policies allow. Rows
-- are never hard-deleted by the app (deletion markers), except through the functions below.
revoke all on public.households, public.household_members, public.invites, public.places, public.items from anon;
revoke insert, delete on public.households, public.household_members from authenticated;
revoke insert, update on public.invites from authenticated;
revoke delete on public.places, public.items from authenticated;
-- A household's name and fridge setting can change; its id and creation time cannot.
revoke update on public.households from authenticated;
grant update (name, fridge) on public.households to authenticated;

-- ---------------------------------------------------------------- functions

-- A new household with the signed-in user as owner, and the default places (S-002, S-007).
create function public.create_household(household_name text) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  hid uuid;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  if exists (select 1 from public.household_members where user_id = uid) then raise exception 'already_in_household'; end if;
  insert into public.households (name) values (coalesce(nullif(trim(household_name), ''), 'Hjem')) returning id into hid;
  insert into public.household_members (household_id, user_id, role, email)
    values (hid, uid, 'owner', coalesce((select email from auth.users where id = uid), ''));
  insert into public.places (household_id, id, kind, sort) values (hid, 'fridge', 'fridge', 0), (hid, 'freezer', 'freezer', 1), (hid, 'pantry', 'pantry', 2);
  return hid;
end;
$$;

-- An invite: a six-letter code (no 0/O, 1/I/L) valid for 7 days. Members only.
create function public.create_invite(hid uuid) returns text
language plpgsql security definer set search_path = ''
as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  new_code text;
  i integer;
begin
  if not public.is_member(hid) then raise exception 'not_a_member'; end if;
  delete from public.invites where household_id = hid and expires_at < now();
  loop
    new_code := '';
    for i in 1..6 loop
      new_code := new_code || substr(alphabet, 1 + floor(random() * length(alphabet))::integer, 1);
    end loop;
    exit when not exists (select 1 from public.invites where code = new_code);
  end loop;
  insert into public.invites (code, household_id, created_by, expires_at) values (new_code, hid, auth.uid(), now() + interval '7 days');
  return new_code;
end;
$$;

-- Join with a code (case and spaces ignored). One household per user: leave the old one first.
create function public.join_household(invite_code text) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  wanted text := upper(regexp_replace(coalesce(invite_code, ''), '[^A-Za-z0-9]', '', 'g'));
  hid uuid;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  select household_id into hid from public.invites where code = wanted and expires_at > now();
  if hid is null then raise exception 'invite_not_found'; end if;
  if exists (select 1 from public.household_members where user_id = uid and household_id = hid) then return hid; end if;
  if exists (select 1 from public.household_members where user_id = uid) then raise exception 'already_in_household'; end if;
  insert into public.household_members (household_id, user_id, role, email)
    values (hid, uid, 'member', coalesce((select email from auth.users where id = uid), ''));
  return hid;
end;
$$;

-- Leave. The oldest remaining member becomes owner; the last one out deletes the household and all
-- its things.
create function public.leave_household() returns void
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  hid uuid;
  was_owner boolean;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  select household_id, role = 'owner' into hid, was_owner from public.household_members where user_id = uid;
  if hid is null then return; end if;
  delete from public.household_members where household_id = hid and user_id = uid;
  if not exists (select 1 from public.household_members where household_id = hid) then
    delete from public.households where id = hid;
  elsif was_owner then
    update public.household_members set role = 'owner'
      where household_id = hid and user_id = (select user_id from public.household_members where household_id = hid order by joined_at, user_id limit 1);
  end if;
end;
$$;

revoke execute on function public.is_member(uuid), public.create_household(text), public.create_invite(uuid), public.join_household(text), public.leave_household() from public, anon;
grant execute on function public.is_member(uuid), public.create_household(text), public.create_invite(uuid), public.join_household(text), public.leave_household() to authenticated;
