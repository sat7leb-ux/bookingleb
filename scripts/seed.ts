/* eslint-disable no-console */
// Seed script — runs the SQL in supabase/seed.sql against a live Supabase
// project via the Management API. Requires SUPABASE_ACCESS_TOKEN +
// SUPABASE_PROJECT_REF in .env.local (or env). The anon/service key cannot run
// arbitrary DDL, so we use the Management REST endpoint.
//
// Usage: npm run seed
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;

if (!TOKEN || !PROJECT_REF) {
  console.error(
    "Missing SUPABASE_ACCESS_TOKEN or SUPABASE_PROJECT_REF. Add them to .env.local.",
  );
  process.exit(1);
}

const sql = readFileSync(resolve(process.cwd(), "supabase/seed.sql"), "utf8");

async function run() {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    },
  );
  const text = await res.text();
  if (!res.ok) {
    console.error("Seed failed:", res.status, text);
    process.exit(1);
  }
  console.log("Seed complete.");
  console.log(text.slice(0, 2000));
}

run();
