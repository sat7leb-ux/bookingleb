import { Pool } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new Pool({ connectionString: url });

async function run() {
  // 1. Find and remove Administrator users
  const { rows: admins } = await pool.query(
    "select id, email, full_name from profiles where role = 'Administrator'",
  );
  for (const a of admins) {
    await pool.query("delete from profiles where id = $1", [a.id]);
    console.log(`✓ Removed Administrator: ${a.email} (${a.full_name})`);
  }
  if (admins.length === 0) {
    console.log("ℹ No Administrator users found.");
  }

  // 2. Reset Mireille's password
  const email = process.argv[2] || "mireille@sat7.org";
  const newPassword = process.argv[3] || "sat7booking";
  const hash = await bcrypt.hash(newPassword, 10);
  const { rows: mireille } = await pool.query(
    "select id, email, full_name from profiles where lower(email) = $1",
    [email.toLowerCase()],
  );
  if (mireille.length === 0) {
    console.log(`✗ User not found: ${email}`);
    await pool.end();
    process.exit(1);
  }
  await pool.query(
    "update profiles set password_hash = $1, active = true where id = $2",
    [hash, mireille[0].id],
  );
  console.log(`✓ Reset password for ${mireille[0].full_name} (${mireille[0].email}) → ${newPassword}`);

  await pool.end();
  console.log("Done.");
}

run().catch(async (e) => {
  console.error("Script failed:", e.message);
  await pool.end();
  process.exit(1);
});
