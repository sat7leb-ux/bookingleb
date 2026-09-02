-- Remove Remote / Virtual location and related booking_locations entries
BEGIN;

WITH target AS (
  SELECT id FROM public.locations WHERE name = 'Remote / Virtual' LIMIT 1
)
DELETE FROM public.booking_locations
WHERE location_id IN (SELECT id FROM target);

WITH target AS (
  SELECT id FROM public.locations WHERE name = 'Remote / Virtual' LIMIT 1
)
DELETE FROM public.locations
WHERE id IN (SELECT id FROM target);

COMMIT;
