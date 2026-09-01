import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const r = await pool.query("select id, confirmation_status from bookings where booking_number='004' limit 1");
  const row = r.rows[0];
  console.log("before:", row);
  await pool.query("update bookings set confirmation_status='Confirmed' where id=$1", [row.id]);
  const r2 = await pool.query("select confirmation_status from bookings where id=$1", [row.id]);
  console.log("after:", r2.rows[0]);
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
