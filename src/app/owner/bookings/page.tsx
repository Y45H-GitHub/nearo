import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusPill } from "@/components/shared/status-pill";
import { getOwnerBookings, type BookingListItem } from "@/features/bookings/queries";
import { getOwnProfile } from "@/features/auth/queries";
import { acceptBooking, rejectBooking } from "@/features/bookings/actions";

const TABS = [
  { key: "requested", label: "Requests", statuses: ["requested"] },
  { key: "upcoming", label: "Upcoming", statuses: ["accepted"] },
  { key: "active", label: "Active", statuses: ["active"] },
  { key: "past", label: "Past", statuses: ["returned", "completed", "disputed"] },
  { key: "other", label: "Rejected/Cancelled", statuses: ["rejected", "cancelled"] },
] as const;

function Row({ booking }: { booking: BookingListItem }) {
  async function accept() {
    "use server";
    await acceptBooking(booking.id);
  }
  async function reject() {
    "use server";
    await rejectBooking(booking.id);
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
        {booking.products?.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={booking.products.cover_image_url}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Link href={`/bookings/${booking.id}`} className="truncate font-medium text-foreground">
          {booking.products?.title ?? "Listing"}
        </Link>
        <p className="text-sm text-muted-foreground">
          {booking.start_date} → {booking.end_date}
        </p>
        <StatusPill status={booking.status} className="mt-1" />
      </div>
      {booking.status === "requested" && (
        <div className="flex shrink-0 gap-2">
          <form action={accept}>
            <Button type="submit" size="sm">
              Accept
            </Button>
          </form>
          <form action={reject}>
            <Button type="submit" variant="outline" size="sm">
              Reject
            </Button>
          </form>
        </div>
      )}
      {(booking.status === "accepted" || booking.status === "active") && (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/bookings/${booking.id}`}>Manage</Link>
        </Button>
      )}
    </div>
  );
}

export default async function OwnerBookingsPage() {
  const own = await getOwnProfile();
  if (!own?.profile) redirect("/login?redirect=/owner/bookings");

  const bookings = await getOwnerBookings();
  const byTab = (statuses: readonly string[]) =>
    bookings.filter((b: BookingListItem) => statuses.includes(b.status));

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Booking requests</h1>

      <Tabs defaultValue="requested">
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.key} value={t.key}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((t) => {
          const items = byTab(t.statuses);
          return (
            <TabsContent key={t.key} value={t.key} className="mt-4">
              {items.length === 0 ? (
                <EmptyState
                  title="Nothing here yet"
                  description="Booking requests for your listings will show up here."
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map((b) => (
                    <Row key={b.id} booking={b} />
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
