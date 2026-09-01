import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const r = await pool.query('select id, booking_number from bookings order by created_at');
  console.log('renaming', r.rows.length, 'bookings');
  await Promise.all(
    r.rows.map((row, idx) => {
      const newNum = String(idx + 1).padStart(3, '0');
      return pool.query('update bookings set booking_number=$1 where id=$2', [newNum, row.id]);
    })
  );
  const check = await pool.query('select booking_number from bookings order by created_at');
  console.log('renamed to:', check.rows.map(x => x.booking_number).join(', '));
  await pool.query('update booking_counters set counter=$1 where year=2026', [r.rows.length]);
  const counter = await pool.query('select counter from booking_counters where year=2026');
  console.log('next counter:', counter.rows[0]);
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
