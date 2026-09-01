import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const count = await pool.query('select count(*) as n from bookings');
  console.log('booking count:', count.rows[0]);
  const rows = await pool.query('select booking_number from bookings order by created_at desc limit 5');
  console.log('latest bookings:', JSON.stringify(rows.rows, null, 2));
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
