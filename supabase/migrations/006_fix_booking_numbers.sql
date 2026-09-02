-- Migrate existing booking numbers to SAT7-2026-XXXXX format
do $$
declare
  row record;
  counter int := 0;
begin
  for row in select id, booking_number from bookings order by created_at asc loop
    counter := counter + 1;
    update bookings set booking_number = 'SAT7-2026-' || lpad(counter::text, 5, '0') where id = row.id;
  end loop;
end $$;
