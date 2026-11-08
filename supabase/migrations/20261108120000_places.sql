-- The household's own places (S-013). A place's kind is Frost (freezer), Køl (fridge) or Tørvarer
-- (pantry); the fridge is no longer a switch on the household but a place like any other. New
-- households start with Fryser, Skabe and Viktualiekammer (ids freezer, pantry, larder; a null name
-- means the app shows the preset's name in the user's language).

alter table public.households drop column fridge;

create or replace function public.create_household(household_name text) returns uuid
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
  insert into public.places (household_id, id, kind, sort) values (hid, 'freezer', 'freezer', 0), (hid, 'pantry', 'pantry', 1), (hid, 'larder', 'pantry', 2);
  return hid;
end;
$$;
