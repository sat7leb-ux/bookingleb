import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  await pool.query("ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check");
  await pool.query("ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role = ANY (ARRAY['Administrator','Production Manager','Production User','Viewer','Guest']))");
  const r = await pool.query("SELECT pg_get_constraintdef(c.oid) FROM pg_constraint c WHERE conname='profiles_role_check'");
  console.log("NEW constraint:", r.rows?.[0]?.pg_get_constraintdef);
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
