import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const before = await pool.query('select year, counter from booking_counters');
  console.log('before:', JSON.stringify(before.rows, null, 2));
  const upd = await pool.query("update booking_counters set counter=0 where year=2026");
  console.log('updated:', upd.rowCount);
  const after = await pool.query('select year, counter from booking_counters');
  console.log('after:', JSON.stringify(after.rows, null, 2));
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
