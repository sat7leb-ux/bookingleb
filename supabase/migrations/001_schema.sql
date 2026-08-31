-- ============================================================================
-- SAT-7 Production Booking — Migration 001: Core schema
-- Normalized relational model. All time fields are stored as text HH:mm
-- or ISO dates; booking_number is generated safely by a DB function.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text not null,
  role text not null default 'Viewer'
    check (role in ('Administrator', 'Production Manager', 'Production User', 'Viewer')),
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- people (guests / contacts)
-- ----------------------------------------------------------------------------
create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  whatsapp text,
  email text,
  department text,
  company text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- channels
-- ----------------------------------------------------------------------------
create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- locations
-- ----------------------------------------------------------------------------
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- programs
-- ----------------------------------------------------------------------------
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel_id uuid references public.channels (id) on delete set null,
  company text,
  default_location text,
  default_place_in text,
  default_top_camera text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- bookings
-- ----------------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_number text not null unique,
  person_id uuid references public.people (id) on delete restrict,
  program_id uuid references public.programs (id) on delete restrict,
  channel_id uuid references public.channels (id) on delete restrict,
  production_date date,
  call_time text,
  start_time text,
  end_time text,
  live_recorded text not null default 'Recorded'
    check (live_recorded in ('Live', 'Recorded')),
  episode_number text,
  recorded_episodes_count integer,
  location_id uuid references public.locations (id) on delete restrict,
  extra_notes text,
  confirmation_status text not null default 'Pending Confirmation'
    check (confirmation_status in (
      'Pending Confirmation', 'Confirmed', 'Declined',
      'Reschedule Requested', 'Cancelled')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- production_requirements (1:1 with booking)
-- ----------------------------------------------------------------------------
create table if not exists public.production_requirements (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  place_in text,
  place_in_time text,
  place_in_location text,
  place_in_notes text,
  top_camera text,
  top_camera_time text,
  top_camera_location text,
  top_camera_notes text
);

-- ----------------------------------------------------------------------------
-- transportation (1:1 with booking)
-- ----------------------------------------------------------------------------
create table if not exists public.transportation (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  type text not null default 'Car'
    check (type in ('Bus','Car','Van','OB Van','Own Transportation','Other')),
  departure_time text,
  pickup_location text,
  driver text,
  notes text
);

-- ----------------------------------------------------------------------------
-- dress_codes (1:1 with booking)
-- ----------------------------------------------------------------------------
create table if not exists public.dress_codes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  code text not null default 'TV Appropriate'
    check (code in ('Formal','Business Casual','Casual','TV Appropriate','Traditional','Other')),
  notes text
);

-- ----------------------------------------------------------------------------
-- booking_activity (timeline)
-- ----------------------------------------------------------------------------
create table if not exists public.booking_activity (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  description text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- whatsapp_messages
-- ----------------------------------------------------------------------------
create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  recipient text,
  message text,
  channel text,
  status text not null default 'prepared'
    check (status in ('prepared','sent','delivered','failed')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- org_settings (single row)
-- ----------------------------------------------------------------------------
create table if not exists public.org_settings (
  id uuid primary key default '00000000-0000-0000-0000-000000000001',
  org_name text not null default 'SAT-7 Production',
  booking_prefix text not null default 'SAT7',
  time_zone text not null default 'UTC',
  date_format text not null default 'MMM d, yyyy',
  default_booking_duration integer not null default 120
);

-- ----------------------------------------------------------------------------
-- booking_counters (per-year sequence for booking numbers)
-- ----------------------------------------------------------------------------
create table if not exists public.booking_counters (
  year integer primary key,
  counter integer not null default 0
);

-- ----------------------------------------------------------------------------
-- indexes
-- ----------------------------------------------------------------------------
create index if not exists idx_bookings_production_date on public.bookings (production_date);
create index if not exists idx_bookings_status on public.bookings (confirmation_status);
create index if not exists idx_bookings_person on public.bookings (person_id);
create index if not exists idx_bookings_program on public.bookings (program_id);
create index if not exists idx_bookings_channel on public.bookings (channel_id);
create index if not exists idx_bookings_created_by on public.bookings (created_by);
create index if not exists idx_people_active on public.people (active);
create index if not exists idx_programs_active on public.programs (active);
create index if not exists idx_activity_booking on public.booking_activity (booking_id);
create index if not exists idx_wa_booking on public.whatsapp_messages (booking_id);
