import { EmptyState } from "@/components/shared/empty-state";
import { BookingRow } from "@/features/bookings/components/booking-row";
import type { BookingListItem } from "@/features/bookings/queries";

export function UpcomingRentalsList({ bookings }: { bookings: BookingListItem[] }) {
  if (bookings.length === 0) {
    return (
      <EmptyState
        title="No upcoming rentals"
        description="Bookings you've accepted will show up here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {bookings.map((b) => (
        <BookingRow key={b.id} booking={b} href={`/bookings/${b.id}`} />
      ))}
    </div>
  );
}
