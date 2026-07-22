import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "@/components/shared/user-menu";
import { getOwnProfile } from "@/features/auth/queries";

/**
 * Minimal chrome through M3 — enough nav to reach every page that exists so
 * far. The full guest/renting/hosting-mode header design from
 * specs/information-architecture.md § 4 (with the "switch to hosting"
 * toggle) is a later polish pass, not yet built.
 */
export async function SiteHeader() {
  const result = await getOwnProfile();

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-lg font-semibold text-foreground">
          Nearo
        </Link>
        <Link href="/explore" className="text-sm text-foreground">
          Explore
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {result?.profile ? (
          <>
            <Button variant="ghost" asChild>
              <Link href="/wishlist">Wishlist</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/owner/listings">My listings</Link>
            </Button>
            <Button asChild>
              <Link href="/owner/listings/new">List an item</Link>
            </Button>
            <UserMenu
              fullName={result.profile.full_name}
              avatarUrl={result.profile.avatar_url}
            />
          </>
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
