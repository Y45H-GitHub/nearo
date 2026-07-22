import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "@/components/shared/user-menu";
import { getOwnProfile } from "@/features/auth/queries";

/**
 * Minimal chrome for M1 — just enough nav to reach auth/profile flows.
 * The full guest/renting/hosting-mode header from
 * specs/information-architecture.md § 4 is built in M3.
 */
export async function SiteHeader() {
  const result = await getOwnProfile();

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <Link href="/" className="text-lg font-semibold text-foreground">
        Nearo
      </Link>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {result?.profile ? (
          <UserMenu
            fullName={result.profile.full_name}
            avatarUrl={result.profile.avatar_url}
          />
        ) : (
          <>
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
