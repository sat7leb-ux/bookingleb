import { Pool } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new Pool({ connectionString: url });

async function run() {
  const { rows } = await pool.query(
    "select id, email, role, active, full_name from profiles order by created_at desc"
  );
  console.log("Users in DB:");
  rows.forEach(u => 
    console.log(`  [${u.role.padEnd(20)}] ${u.email} (${u.full_name}) active=${u.active}`)
  );
  await pool.end();
}

run().catch(async (e) => {
  console.error("Failed:", e.message);
  await pool.end();
  process.exit(1);
});
