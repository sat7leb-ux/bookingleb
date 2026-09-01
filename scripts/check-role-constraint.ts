import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const res = await pool.query(
    "SELECT pg_get_constraintdef(c.oid) FROM pg_constraint c WHERE conname='profiles_role_check'"
  );
  console.log("Current constraint:", res.rows?.[0]?.pg_get_constraintdef || "NOT FOUND");
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
