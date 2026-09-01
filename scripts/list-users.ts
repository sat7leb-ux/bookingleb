import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const u = await pool.query('select id,email,full_name,role,active from profiles');
  console.log(JSON.stringify(u.rows, null, 2));
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
