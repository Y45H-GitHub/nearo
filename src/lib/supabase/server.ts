import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Server Component / Server Action client. Uses the anon key + the caller's
 * session cookies, so it's still bound by RLS — this is NOT the service-role
 * client. Per ADR 0007, this is what queries/ and actions/ use by default.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component render — middleware refreshes
            // the session instead. Safe to ignore.
          }
        },
      },
    },
  );
}
