import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "./config";
import { createCookieClient } from "./server";

/**
 * Service-role admin client for Server Action writes.
 *
 * CRITICAL: Server Actions that write to the DB must use this client, NOT the
 * cookie client (whose cookie store is read-only inside actions -> white screen).
 *
 * Graceful fallback: if SUPABASE_SERVICE_ROLE_KEY is missing (e.g. a deploy that
 * didn't get the secret, or a demo), we fall back to the RLS cookie client so no
 * action ever throws and white-screens. Writes stay scoped per-user / admin-gated
 * by the application code. Never commit the service-role key to the client bundle.
 */
export function createAdminClient() {
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRole) {
    return createClient(getSupabaseUrl(), serviceRole, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return createCookieClient();
}
