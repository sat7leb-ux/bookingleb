import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Pool } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Add it to .env.local.");
  process.exit(1);
}

const pool = new Pool({ connectionString: url });

async function run() {
  const sql = readFileSync(resolve(process.cwd(), "supabase/seed.sql"), "utf8");
  console.log("→ Applying seed.sql");
  await pool.query(sql);

  // Bootstrap an admin user (idempotent). Override via env if provided.
  const email = (process.env.BOOTSTRAP_ADMIN_EMAIL || "admin@bookingleb.app").toLowerCase();
  const pw = process.env.BOOTSTRAP_ADMIN_PASSWORD || "Admin1234!";
  const { rows } = await pool.query("select id from profiles where email = $1", [email]);
  if (rows.length === 0) {
    const hash = await bcrypt.hash(pw, 10);
    await pool.query(
      "insert into profiles (full_name, email, role, active, password_hash) values ($1,$2,'Administrator',true,$3)",
      ["Administrator", email, hash],
    );
    console.log(`✓ Admin user created: ${email} / ${pw}`);
  } else {
    console.log("ℹ Admin user already exists.");
  }
  await pool.end();
}

run().catch(async (e) => {
  console.error("Seed failed:", e.message);
  await pool.end();
  process.exit(1);
});
