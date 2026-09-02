-- Remove old SAT7-2026- prefix from existing bookings and renumber sequentially
-- This keeps data intact but normalizes booking_number display.

-- 1. Strip any SAT7-2026- prefix if it still exists
update public.bookings
set booking_number = regexp_replace(booking_number, '^SAT7-2026-', '', 'g')
where booking_number ~ '^SAT7-2026-';

-- 2. Reapply sequential order by created_at so numbering is clean
do $$
declare
  r record;
  next_num int := 1;
begin
  for r in select id from bookings order by created_at asc loop
    update bookings
    set booking_number = lpad(next_num::text, 3, '0')
    where id = r.id;
    next_num := next_num + 1;
  end loop;
end;
$$;
