-- Multiple locations per booking
create table if not exists public.booking_locations (
  booking_id uuid not null references public.bookings (id) on delete cascade,
  location_id uuid not null references public.locations (id) on delete restrict,
  primary key (booking_id, location_id)
);

create index if not exists idx_booking_locations_booking on public.booking_locations (booking_id);
create index if not exists idx_booking_locations_location on public.booking_locations (location_id);
