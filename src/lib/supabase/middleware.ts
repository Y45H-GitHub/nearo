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

  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.rewrite(new URL("/404", request.url));
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    // Placeholder Database type (src/types/database.ts) can't narrow this
    // until real generated types exist — see that file's header comment.
    const role = (profile as { role?: string } | null)?.role;
    if (role !== "admin") {
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
