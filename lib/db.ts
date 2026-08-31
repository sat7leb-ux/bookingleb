import "server-only";
import { Pool } from "@neondatabase/serverless";
import { DATABASE_URL } from "./config";

/**
 * Neon serverless Postgres pool. Replaces the Supabase client.
 * RLS is enforced in application code (lib/auth.ts + service-layer checks).
 * `db()` never throws — it returns { rows, rowCount, error } so Server Actions
 * can surface friendly messages instead of white-screening.
 */
const globalForDb = globalThis as unknown as { __pool?: Pool };

export const pool =
  globalForDb.__pool ??
  new Pool({
    connectionString: DATABASE_URL || "postgresql://localhost:5432/placeholder",
  });

if (process.env.NODE_ENV !== "production") globalForDb.__pool = pool;

export interface DbResult<T = any> {
  rows: T[];
  rowCount: number | null;
  error: Error | null;
}

export async function db<T = any>(
  text: string,
  params: unknown[] = [],
): Promise<DbResult<T>> {
  try {
    const res = await pool.query(text, params);
    return { rows: res.rows as T[], rowCount: res.rowCount, error: null };
  } catch (error) {
    return { rows: [], rowCount: null, error: error as Error };
  }
}

export async function tx<T>(fn: (q: typeof db) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const scopedDb = async (text: string, params: unknown[] = []) => {
      try {
        const r = await client.query(text, params);
        return { rows: r.rows as any[], rowCount: r.rowCount, error: null };
      } catch (error) {
        return { rows: [], rowCount: null, error: error as Error };
      }
    };
    const result = await fn(scopedDb);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
