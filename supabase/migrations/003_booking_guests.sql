-- SAT-7 Production Booking — Migration 003: multiple guests per booking
-- A single shooting/production can involve several people (guests).
-- We keep bookings.person_id as the "primary guest" (backward compatible with
-- existing bookings and list/dashboard queries) and add a booking_guests join
-- table that holds ALL guests for a booking (including the primary).

create table if not exists public.booking_guests (
  booking_id uuid not null references public.bookings (id) on delete cascade,
  person_id  uuid not null references public.people (id) on delete restrict,
  role       text,
  notes      text,
  created_at timestamptz not null default now(),
  primary key (booking_id, person_id)
);

create index if not exists booking_guests_booking_idx on public.booking_guests (booking_id);
create index if not exists booking_guests_person_idx  on public.booking_guests (person_id);

insert into public.booking_guests (booking_id, person_id, role)
select id, person_id, 'Guest'
from public.bookings
where person_id is not null
  and not exists (
    select 1 from public.booking_guests g where g.booking_id = bookings.id and g.person_id = bookings.person_id
  );
