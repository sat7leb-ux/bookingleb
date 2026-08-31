"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

/**
 * Browser Supabase client (RLS-enforced, uses the visitor's session cookie).
 * Use for: realtime subscriptions, and client-side reads that should respect RLS.
 * NOTE: do NOT use this for DB writes inside Server Actions — see lib/supabase/admin.
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
