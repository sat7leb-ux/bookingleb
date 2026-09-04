-- Fix bookings_confirmation_status_check to include 'In Progress'
-- The code now uses 'In Progress' as default, but the live DB constraint may not include it.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'bookings_confirmation_status_check' AND table_name = 'bookings') THEN
    ALTER TABLE bookings DROP CONSTRAINT bookings_confirmation_status_check;
  END IF;
END $$;

ALTER TABLE bookings
  ADD CONSTRAINT bookings_confirmation_status_check
  CHECK (confirmation_status IN ('In Progress','Confirmed','Declined','Reschedule Requested','Cancelled'));
