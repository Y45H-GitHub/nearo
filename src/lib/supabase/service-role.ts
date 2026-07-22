import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service-role client — bypasses RLS entirely. Only ever import this inside
 * Server Actions or Route Handlers (per ADR 0007), and only after the caller's
 * permission has already been checked with the session-bound client. Used for
 * tables with no client-write RLS policy at all: payments, notifications.
 * Never import this in a Client Component — the service-role key must never
 * reach the browser bundle.
 */
export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
