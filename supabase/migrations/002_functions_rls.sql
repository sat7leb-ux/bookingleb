-- ============================================================================
-- SAT-7 Production Booking — Migration 002: functions, triggers, RLS, realtime
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Role helper functions (SECURITY DEFINER so they can read profiles)
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'Administrator' and active = true
  );
$$;

create or replace function public.is_manager()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('Administrator', 'Production Manager') and active = true
  );
$$;

create or replace function public.can_write_bookings()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('Administrator', 'Production Manager', 'Production User')
      and active = true
  );
$$;

-- ----------------------------------------------------------------------------
-- Auto-create profile row on new auth user
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, role, active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'Viewer'),
    true
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- updated_at trigger (generic)
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
drop trigger if exists trg_people_updated on public.people;
create trigger trg_people_updated before update on public.people
  for each row execute function public.set_updated_at();
drop trigger if exists trg_programs_updated on public.programs;
create trigger trg_programs_updated before update on public.programs
  for each row execute function public.set_updated_at();
drop trigger if exists trg_bookings_updated on public.bookings;
create trigger trg_bookings_updated before update on public.bookings
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Safe booking number generator (row-locked counter => concurrency-proof)
-- Format: <PREFIX>-<YYYY>-<NNNNN>
-- ----------------------------------------------------------------------------
create or replace function public.generate_booking_number()
returns text language plpgsql as $$
declare
  v_year integer := extract(year from now());
  v_prefix text;
  v_counter integer;
  v_result text;
begin
  select booking_prefix into v_prefix from public.org_settings limit 1;
  if v_prefix is null or v_prefix = '' then
    v_prefix := 'SAT7';
  end if;

  -- Atomic upsert: insert the year row or increment the existing one.
  insert into public.booking_counters (year, counter)
  values (v_year, 1)
  on conflict (year) do update set counter = booking_counters.counter + 1
  returning counter into v_counter;

  v_result := v_prefix || '-' || v_year::text || '-' ||
              lpad(v_counter::text, 5, '0');
  return v_result;

  return v_result;
end; $$;

-- BEFORE INSERT trigger fills booking_number when omitted
create or replace function public.fill_booking_number()
returns trigger language plpgsql as $$
begin
  if new.booking_number is null or new.booking_number = '' then
    new.booking_number := public.generate_booking_number();
  end if;
  return new;
end; $$;

drop trigger if exists trg_booking_number on public.bookings;
create trigger trg_booking_number before insert on public.bookings
  for each row execute function public.fill_booking_number();

-- Seed the single org_settings row (idempotent)
insert into public.org_settings (id) values ('00000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.people enable row level security;
alter table public.channels enable row level security;
alter table public.locations enable row level security;
alter table public.programs enable row level security;
alter table public.bookings enable row level security;
alter table public.production_requirements enable row level security;
alter table public.transportation enable row level security;
alter table public.dress_codes enable row level security;
alter table public.booking_activity enable row level security;
alter table public.whatsapp_messages enable row level security;
alter table public.org_settings enable row level security;

-- ---- profiles ----
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated using (true);
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
drop policy if exists profiles_admin on public.profiles;
create policy profiles_admin on public.profiles
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---- people ----
drop policy if exists people_select on public.people;
create policy people_select on public.people for select to authenticated using (true);
drop policy if exists people_write on public.people;
create policy people_write on public.people
  for all to authenticated using (public.is_manager()) with check (public.is_manager());

-- ---- channels ----
drop policy if exists channels_select on public.channels;
create policy channels_select on public.channels for select to authenticated using (true);
drop policy if exists channels_write on public.channels;
create policy channels_write on public.channels
  for all to authenticated using (public.is_manager()) with check (public.is_manager());

-- ---- locations ----
drop policy if exists locations_select on public.locations;
create policy locations_select on public.locations for select to authenticated using (true);
drop policy if exists locations_write on public.locations;
create policy locations_write on public.locations
  for all to authenticated using (public.is_manager()) with check (public.is_manager());

-- ---- programs ----
drop policy if exists programs_select on public.programs;
create policy programs_select on public.programs for select to authenticated using (true);
drop policy if exists programs_write on public.programs;
create policy programs_write on public.programs
  for all to authenticated using (public.is_manager()) with check (public.is_manager());

-- ---- bookings ----
drop policy if exists bookings_select on public.bookings;
create policy bookings_select on public.bookings for select to authenticated using (true);
drop policy if exists bookings_insert on public.bookings;
create policy bookings_insert on public.bookings
  for insert to authenticated with check (public.can_write_bookings());
drop policy if exists bookings_update on public.bookings;
create policy bookings_update on public.bookings
  for update to authenticated using (public.can_write_bookings()) with check (public.can_write_bookings());
drop policy if exists bookings_delete on public.bookings;
create policy bookings_delete on public.bookings
  for delete to authenticated using (public.is_manager());

-- ---- child tables ----
drop policy if exists prodreq_select on public.production_requirements;
create policy prodreq_select on public.production_requirements for select to authenticated using (true);
drop policy if exists prodreq_write on public.production_requirements;
create policy prodreq_write on public.production_requirements
  for all to authenticated using (public.can_write_bookings()) with check (public.can_write_bookings());

drop policy if exists transp_select on public.transportation;
create policy transp_select on public.transportation for select to authenticated using (true);
drop policy if exists transp_write on public.transportation;
create policy transp_write on public.transportation
  for all to authenticated using (public.can_write_bookings()) with check (public.can_write_bookings());

drop policy if exists dress_select on public.dress_codes;
create policy dress_select on public.dress_codes for select to authenticated using (true);
drop policy if exists dress_write on public.dress_codes;
create policy dress_write on public.dress_codes
  for all to authenticated using (public.can_write_bookings()) with check (public.can_write_bookings());

drop policy if exists activity_select on public.booking_activity;
create policy activity_select on public.booking_activity for select to authenticated using (true);
drop policy if exists activity_insert on public.booking_activity;
create policy activity_insert on public.booking_activity
  for insert to authenticated with check (public.can_write_bookings());

drop policy if exists wa_select on public.whatsapp_messages;
create policy wa_select on public.whatsapp_messages for select to authenticated using (true);
drop policy if exists wa_insert on public.whatsapp_messages;
create policy wa_insert on public.whatsapp_messages
  for insert to authenticated with check (public.can_write_bookings());

-- ---- org_settings ----
drop policy if exists org_select on public.org_settings;
create policy org_select on public.org_settings for select to authenticated using (true);
drop policy if exists org_write on public.org_settings;
create policy org_write on public.org_settings
  for all to authenticated using (public.is_manager()) with check (public.is_manager());

-- ============================================================================
-- Realtime (add tables to the supabase_realtime publication)
-- ============================================================================
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'public.bookings', 'public.booking_activity', 'public.whatsapp_messages',
      'public.people', 'public.programs', 'public.channels', 'public.locations'
    ])
  loop
    begin
      execute format('alter publication supabase_realtime add table %s', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;
