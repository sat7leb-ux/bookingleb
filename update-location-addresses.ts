import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  await pool.query('update locations set address = $1 where name = $2', ['Outdoor', 'Outdoor OBVAN']);
  await pool.query('update locations set address = $1 where name = $2', ['Studio', 'Studio 1']);
  await pool.query('update locations set address = $1 where name = $2', ['Studio', 'Studio Chroma']);
  await pool.query('update locations set address = $1 where name = $2', ['Remote', 'Remote / Virtual']);
  
  const r = await pool.query('select id,name,address from locations order by name');
  console.log(r.rows);
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
