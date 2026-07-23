import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { BookingRow } from "@/features/bookings/components/booking-row";
import { getCustomerBookings, type BookingListItem } from "@/features/bookings/queries";
import { getOwnProfile } from "@/features/auth/queries";

const TABS = [
  { key: "requested", label: "Requested", statuses: ["requested"] },
  { key: "upcoming", label: "Upcoming", statuses: ["accepted"] },
  { key: "active", label: "Active", statuses: ["active"] },
  { key: "past", label: "Past", statuses: ["returned", "completed", "disputed"] },
  { key: "cancelled", label: "Cancelled", statuses: ["rejected", "cancelled"] },
] as const;

export default async function MyBookingsPage() {
  const own = await getOwnProfile();
  if (!own?.profile) redirect("/login?redirect=/bookings");

  const bookings = await getCustomerBookings();
  const byTab = (statuses: readonly string[]) =>
    bookings.filter((b: BookingListItem) => statuses.includes(b.status));

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-semibold text-foreground">My bookings</h1>

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
                  description="Your rentals will show up here once you request one."
                  actionHref="/explore"
                  actionLabel="Explore listings"
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map((b) => (
                    <BookingRow key={b.id} booking={b} href={`/bookings/${b.id}`} />
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
