import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Pool } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new Pool({ connectionString: url });

async function run() {
  const loc = await pool.query("select id from public.locations where name = 'Remote / Virtual'");
  if (!loc.rows.length) {
    console.log("Location 'Remote / Virtual' not found.");
    return;
  }
  const id = loc.rows[0].id;

  const bl = await pool.query("select booking_id from public.booking_locations where location_id = $1", [id]);
  console.log(`Found ${bl.rows.length} booking_locations rows to remove`);

  await pool.query("delete from public.booking_locations where location_id = $1", [id]);
  await pool.query("delete from public.locations where id = $1", [id]);
  console.log("Removed 'Remote / Virtual' location.");
}

run().catch(async (e) => {
  console.error("Failed:", e.message);
  await pool.end();
  process.exit(1);
}).finally(async () => {
  await pool.end();
});
