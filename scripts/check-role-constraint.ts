import { Pool } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new Pool({ connectionString: url });

async function main() {
  const res = await pool.query(
    "SELECT pg_get_constraintdef(c.oid) FROM pg_constraint c WHERE conname='profiles_role_check'"
  );
  console.log("profiles_role_check:", res.rows?.[0]?.pg_get_constraintdef || "NOT FOUND");

  const rolesRes = await pool.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='profiles' AND column_name='role'"
  );
  console.log("role column:", rolesRes.rows?.[0] || "NOT FOUND");
}

main()
  .then(() => pool.end())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
