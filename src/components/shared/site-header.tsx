import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "@/components/shared/user-menu";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { getOwnProfile } from "@/features/auth/queries";
import { getTotalUnreadCount } from "@/features/messaging/queries";
import { getNotifications, getUnreadNotificationCount } from "@/features/notifications/queries";

/**
 * Minimal chrome through M3 — enough nav to reach every page that exists so
 * far. The full guest/renting/hosting-mode header design from
 * specs/information-architecture.md § 4 (with the "switch to hosting"
 * toggle) is a later polish pass, not yet built.
 */
export async function SiteHeader() {
  const result = await getOwnProfile();
  const unreadCount = result?.profile ? await getTotalUnreadCount() : 0;
  const [notifications, unreadNotifications] = result?.profile
    ? await Promise.all([getNotifications(10), getUnreadNotificationCount()])
    : [[], 0];

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
            <NotificationBell notifications={notifications} unreadCount={unreadNotifications} />
            <Button variant="ghost" asChild className="relative">
              <Link href="/messages">
                Messages
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/wishlist">Wishlist</Link>
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
