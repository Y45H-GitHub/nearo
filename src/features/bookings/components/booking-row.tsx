import Link from "next/link";
import { StatusPill } from "@/components/shared/status-pill";
import type { BookingListItem } from "@/features/bookings/queries";

export function BookingRow({
  booking,
  href,
}: {
  booking: BookingListItem;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 hover:shadow-sm"
    >
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
        <p className="truncate font-medium text-foreground">
          {booking.products?.title ?? "Listing"}
        </p>
        <p className="text-sm text-muted-foreground">
          {booking.start_date} → {booking.end_date}
        </p>
        <StatusPill status={booking.status} className="mt-1" />
      </div>
    </Link>
  );
}
