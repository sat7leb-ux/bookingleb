import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const del = await pool.query('delete from locations where name in ($1,$2) returning id,name', ['Amman outdoor','Cairo media city']);
  console.log('Deleted:', del.rows);
  const remaining = await pool.query('select id,name,active from locations order by name');
  console.log('Remaining:', remaining.rows);
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
