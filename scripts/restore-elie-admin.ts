import { Pool } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new Pool({ connectionString: url });

async function run() {
  // Recreate Elie Khachane as Administrator
  const email = "eliekhachane@sat7.org";
  const fullName = "Elie Khachane";
  const password = "@cc3pt3D2026";
  const hash = await bcrypt.hash(password, 10);

  // Check if user exists
  const { rows: existing } = await pool.query(
    "select id, email, role, active from profiles where lower(email) = $1",
    [email.toLowerCase()],
  );

  if (existing.length === 0) {
    await pool.query(
      "insert into profiles (full_name, email, role, active, password_hash) values ($1, $2, 'Administrator', true, $3)",
      [fullName, email, hash],
    );
    console.log(`✓ Created Administrator: ${email} / ${password}`);
  } else {
    await pool.query(
      "update profiles set role = 'Administrator', active = true, password_hash = $1, full_name = $2 where id = $3",
      [hash, fullName, existing[0].id],
    );
    console.log(`✓ Updated Administrator: ${email} / ${password}`);
  }

  await pool.end();
  console.log("Done.");
}

run().catch(async (e) => {
  console.error("Script failed:", e.message);
  await pool.end();
  process.exit(1);
});
