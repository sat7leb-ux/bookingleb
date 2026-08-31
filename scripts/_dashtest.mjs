import { Pool } from "@neondatabase/serverless";
const url = "postgresql://neondb_owner:npg_ME1W0FOSsqCZ@ep-wild-fire-awrk3scz-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const pool = new Pool({ connectionString: url });
async function q(sql){ const r = await pool.query(sql); return r.rows; }
try {
  const all = await q("select b.confirmation_status, b.production_date, b.live_recorded, c.name as channel_name from bookings b left join channels c on c.id = b.channel_id");
  console.log("bookings rows:", all.length);
  const recent = await q(`select b.*, p.full_name as person_full_name, pr.name as program_name, c.name as channel_name, l.name as location_name from bookings b left join people p on p.id=b.person_id left join programs pr on pr.id=b.program_id left join channels c on c.id=b.channel_id left join locations l on l.id=b.location_id order by b.production_date asc limit 8`);
  console.log("recent rows:", recent.length);
  const tl = await q(`select a.*, p.full_name as actor_full_name, p.email as actor_email from booking_activity a left join profiles p on p.id=a.actor_id order by a.created_at desc limit 8`);
  console.log("timeline rows:", tl.length);
  console.log("DASHBOARD QUERIES OK");
} catch(e){ console.log("QUERY ERROR:", e.message); }
await pool.end();
