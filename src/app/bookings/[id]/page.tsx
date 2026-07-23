import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { StatusPill } from "@/components/shared/status-pill";
import { PriceBreakdown } from "@/features/bookings/components/price-breakdown";
import { BookingActions } from "@/features/bookings/components/booking-actions";
import { BookingTransitionTrigger } from "@/features/bookings/components/booking-transition-trigger";
import { ReviewForm } from "@/features/reviews/components/review-form";
import { getBookingDetail } from "@/features/bookings/queries";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getBookingDetail(id);
  if (!result) notFound();
  const { booking, viewerRole, counterpart, viewerHasReviewed } = result;

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <BookingTransitionTrigger bookingId={id} />

      <Link
        href={viewerRole === "owner" ? "/owner/bookings" : "/bookings"}
        className="text-sm text-muted-foreground"
      >
        ← Back to bookings
      </Link>

      <div className="my-4 flex items-center gap-3 rounded-lg border border-border p-3">
        {booking.products?.cover_image_url && (
          <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
            <Image src={booking.products.cover_image_url} alt="" fill className="object-cover" />
          </div>
        )}
        <div>
          <p className="font-medium text-foreground">{booking.products?.title ?? "Listing"}</p>
          <p className="text-sm text-muted-foreground">
            {booking.start_date} → {booking.end_date}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
        <StatusPill status={booking.status} />

        <PriceBreakdown
          subtotalAmount={booking.subtotal_amount}
          depositAmount={booking.deposit_amount}
          platformFeeAmount={viewerRole === "owner" ? booking.platform_fee_amount : undefined}
        />

        {booking.cancellation_reason && (
          <p className="text-sm text-muted-foreground">
            Note: {booking.cancellation_reason}
          </p>
        )}

        <BookingActions bookingId={booking.id} status={booking.status} viewerRole={viewerRole} />

        {["returned", "completed"].includes(booking.status) &&
          (viewerHasReviewed ? (
            <p className="text-sm text-muted-foreground">You&apos;ve reviewed this rental.</p>
          ) : (
            <ReviewForm bookingId={booking.id} revieweeName={counterpart?.full_name ?? "the other party"} />
          ))}
        {booking.status === "disputed" && (
          <p className="text-sm text-status-pending">
            This booking is under admin review.
          </p>
        )}
      </div>
    </div>
  );
}
