import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

/**
 * Refreshes the Supabase auth session on every request and enforces the
 * route-access rules from specs/information-architecture.md § 5:
 * non-admins hitting /admin/* get a 404, not a redirect — we don't want to
 * confirm the admin surface exists to someone who shouldn't see it.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetched once for any logged-in request — role gates /admin/*, is_suspended
  // is checked globally so an account suspended mid-session gets signed out
  // on its very next request rather than staying live until the token expires.
  let profile: { role?: string; is_suspended?: boolean } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("role, is_suspended")
      // Placeholder Database type (src/types/database.ts) can't narrow this
      // until real generated types exist — see that file's header comment.
      .eq("id", user.id)
      .single();
    profile = data as { role?: string; is_suspended?: boolean } | null;
  }

  if (user && profile?.is_suspended) {
    await supabase.auth.signOut();
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("suspended", "1");
    return NextResponse.redirect(redirectUrl);
  }

  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user || profile?.role !== "admin") {
      return NextResponse.rewrite(new URL("/404", request.url));
    }
  }

  const protectedPrefixes = ["/profile", "/wishlist", "/bookings", "/messages", "/notifications", "/owner"];
  const isProtected = protectedPrefixes.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );
  if (isProtected && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
