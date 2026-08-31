import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Pool } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Add it to .env.local.");
  process.exit(1);
}

const files = ["supabase/migrations/001_schema.sql", "supabase/migrations/002_functions_rls.sql", "supabase/migrations/003_booking_guests.sql"];
const pool = new Pool({ connectionString: url });

async function run() {
  for (const f of files) {
    const sql = readFileSync(resolve(process.cwd(), f), "utf8");
    console.log(`→ Applying ${f}`);
    await pool.query(sql);
  }
  console.log("✓ Migrations applied.");
  await pool.end();
}

run().catch(async (e) => {
  console.error("Migration failed:", e.message);
  await pool.end();
  process.exit(1);
});
