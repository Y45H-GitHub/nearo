import { redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { getNotifications } from "@/features/notifications/queries";
import { markAllNotificationsRead } from "@/features/notifications/actions";
import { getOwnProfile } from "@/features/auth/queries";

export default async function NotificationsPage() {
  const own = await getOwnProfile();
  if (!own?.profile) redirect("/login?redirect=/notifications");

  const notifications = await getNotifications(100);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
        {notifications.some((n) => !n.read_at) && (
          <form action={markAllNotificationsRead}>
            <button type="submit" className="text-sm text-foreground underline underline-offset-4">
              Mark all read
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="Activity on your bookings, messages, and listings will show up here."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {notifications.map((n) => (
            <li key={n.id}>
              <Link
                href={n.href}
                className={cn(
                  "flex flex-col gap-0.5 rounded-lg border border-border p-3 hover:shadow-sm",
                  !n.read_at && "bg-secondary/50",
                )}
              >
                <span className="text-sm font-medium text-foreground">{n.title}</span>
                <span className="text-sm text-muted-foreground">{n.body}</span>
                <span className="mt-1 text-xs text-muted-foreground">
                  {new Date(n.created_at).toLocaleString("en-IN")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
