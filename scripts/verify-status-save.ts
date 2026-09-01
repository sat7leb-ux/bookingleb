import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const r = await pool.query("select id, confirmation_status, booking_number from bookings where confirmation_status != 'Cancelled' order by created_at limit 1");
  const row = r.rows[0];
  if (!row) { console.log('no non-cancelled booking'); await pool.end(); return; }
  const next = row.confirmation_status === 'Pending Confirmation' ? 'Confirmed' : 'Pending Confirmation';
  console.log('target:', row.booking_number, row.confirmation_status, '->', next);
  await pool.query("update bookings set confirmation_status=$1 where id=$2", [next, row.id]);
  const r2 = await pool.query("select confirmation_status from bookings where id=$1", [row.id]);
  console.log('after:', r2.rows[0]);
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
