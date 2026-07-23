import { redirect } from "next/navigation";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { getThreads } from "@/features/messaging/queries";
import { getOwnProfile } from "@/features/auth/queries";

export default async function MessagesInboxPage() {
  const own = await getOwnProfile();
  if (!own?.profile) redirect("/login?redirect=/messages");

  const threads = await getThreads();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Messages</h1>

      {threads.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          description="Message an owner from any listing to start one."
          actionHref="/explore"
          actionLabel="Explore listings"
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {threads.map((t) => (
            <li key={t.id}>
              <Link
                href={`/messages/${t.id}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:shadow-sm"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                  {t.products?.cover_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.products.cover_image_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {t.products?.title ?? "Listing"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.last_message_at
                      ? new Date(t.last_message_at).toLocaleString("en-IN")
                      : "No messages yet"}
                  </p>
                </div>
                {t.unreadCount > 0 && (
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {t.unreadCount}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
