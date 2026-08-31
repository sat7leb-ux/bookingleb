-- ============================================================================
-- SAT-7 Production Booking — Migration 002: triggers + safe booking number
-- (No RLS — roles enforced in app code. No Supabase auth.users.)
-- ============================================================================

-- updated_at trigger (generic)
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

-- Safe booking number generator (row-locked counter => concurrency-proof)
-- Format: <PREFIX>-<YYYY>-<NNNNN>
create or replace function public.generate_booking_number()
returns text language plpgsql as $$
declare
  v_year integer := extract(year from now());
  v_prefix text;
  v_counter integer;
  v_result text;
begin
  select booking_prefix into v_prefix from public.org_settings limit 1;
  if v_prefix is null or v_prefix = '' then v_prefix := 'SAT7'; end if;

  insert into public.booking_counters (year, counter) values (v_year, 1)
  on conflict (year) do update set counter = booking_counters.counter + 1
  returning counter into v_counter;

  v_result := v_prefix || '-' || v_year::text || '-' || lpad(v_counter::text, 5, '0');
  return v_result;
end; $$;

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

-- Seed the single org_settings row (idempotent). Done in scripts/seed.ts
-- (kept out of this migration so it runs after demo data is inserted).
