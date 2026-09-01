import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Pool } from "@neondatabase/serverless";

const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
const match = env.match(/^DATABASE_URL=(.*)$/m);
if (!match) throw new Error("DATABASE_URL is missing from .env.local.");
const pool = new Pool({ connectionString: match[1].replace(/^['"]|['"]$/g, "") });

async function main() {
  // Regression check for the exact list/calendar query seam: the transportation
  // JOIN alias and selected alias must agree, or db() silently returns [].
  const result = await pool.query(`
    select b.booking_number, to_char(b.production_date, 'YYYY-MM-DD') as production_date,
      p.full_name as person_full_name,
      pr.name as program_name,
      c.name as channel_name,
      l.name as location_name,
      tr.type as transportation_type,
      d.code as dress_code,
      (select count(*) from public.booking_guests bg where bg.booking_id = b.id) as guest_count
    from bookings b
    left join people p on p.id = b.person_id
    left join programs pr on pr.id = b.program_id
    left join channels c on c.id = b.channel_id
    left join locations l on l.id = b.location_id
    left join transportation tr on tr.booking_id = b.id
    left join dress_codes d on d.booking_id = b.id
    order by b.production_date desc
    limit 10000
  `);

  if (result.rows.length < 1) throw new Error("Expected at least one live booking.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result.rows[0].production_date)) {
    throw new Error(`Expected YYYY-MM-DD production date but received ${result.rows[0].production_date}.`);
  }
  const byMonth = result.rows.reduce<Record<string, number>>((months, row) => {
    const month = row.production_date.slice(0, 7);
    months[month] = (months[month] ?? 0) + 1;
    return months;
  }, {});
  console.log(JSON.stringify({ rows: result.rows.length, first: result.rows[0].booking_number, byMonth }, null, 2));
}

main()
  .catch((error) => { console.error(error.message); process.exitCode = 1; })
  .finally(() => pool.end());
