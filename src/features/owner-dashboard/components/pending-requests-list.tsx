import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { acceptBooking, rejectBooking } from "@/features/bookings/actions";
import type { BookingListItem } from "@/features/bookings/queries";

export function PendingRequestsList({ bookings }: { bookings: BookingListItem[] }) {
  if (bookings.length === 0) {
    return (
      <EmptyState
        title="No pending requests"
        description="New booking requests for your listings will show up here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {bookings.map((booking) => {
        async function accept() {
          "use server";
          await acceptBooking(booking.id);
        }
        async function reject() {
          "use server";
          await rejectBooking(booking.id);
        }

        return (
          <div
            key={booking.id}
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
          >
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
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
            </div>
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
          </div>
        );
      })}
    </div>
  );
}
