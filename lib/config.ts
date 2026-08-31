/**
 * App configuration. Uses Neon Postgres (free) instead of Supabase.
 * The anon/public env fallback lets the build succeed even before DATABASE_URL is set.
 */
export const DATABASE_URL = process.env.DATABASE_URL || "";

export function isDbConfigured(): boolean {
  return !!DATABASE_URL && DATABASE_URL.startsWith("postgresql");
}
