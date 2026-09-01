import { Pool } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Add it to .env.local.");
  process.exit(1);
}

const pool = new Pool({ connectionString: url });

async function run() {
  const email = "eliekhachane@sat7.org";
  const password = "@cc3pt3D2026";
  const fullName = "Elie Khachane";

  // Check if user exists
  const { rows: existing } = await pool.query(
    "select id, email, role, active from profiles where email = $1",
    [email],
  );

  const hash = await bcrypt.hash(password, 10);

  if (existing.length === 0) {
    // Create new admin user
    await pool.query(
      "insert into profiles (full_name, email, role, active, password_hash) values ($1, $2, 'Administrator', true, $3)",
      [fullName, email, hash],
    );
    console.log(`✓ Created admin user: ${email} / ${password}`);
  } else {
    // Update existing user to admin
    await pool.query(
      "update profiles set full_name = $1, role = 'Administrator', active = true, password_hash = $2 where email = $3",
      [fullName, hash, email],
    );
    console.log(`✓ Updated admin user: ${email} / ${password}`);
  }

  // Also update the old admin@bookingleb.app user's role if they still exist
  const { rows: oldAdmin } = await pool.query(
    "select id, email from profiles where email = $1",
    ["admin@bookingleb.app"],
  );
  if (oldAdmin.length > 0) {
    console.log(`ℹ Old admin user still exists: ${oldAdmin[0].email}`);
  }

  await pool.end();
  console.log("Done.");
}

run().catch(async (e) => {
  console.error("Script failed:", e.message);
  await pool.end();
  process.exit(1);
});
