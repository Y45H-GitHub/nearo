import { cn } from "@/lib/utils";
import type { BookingStatus, ProductStatus } from "@/types/domain";

/**
 * Color mapping is authoritative here — see design-tokens.md § 2. Don't
 * re-derive status colors inline anywhere else in the app.
 */
const STATUS_STYLES: Record<
  ProductStatus | BookingStatus,
  { label: string; className: string }
> = {
  draft: { label: "Draft", className: "bg-status-pending/15 text-status-pending" },
  requested: { label: "Requested", className: "bg-status-pending/15 text-status-pending" },
  available: { label: "Available", className: "bg-status-success/15 text-status-success" },
  accepted: { label: "Accepted", className: "bg-status-success/15 text-status-success" },
  booked: { label: "Booked", className: "bg-status-success/15 text-status-success" },
  booking_requested: {
    label: "Booking requested",
    className: "bg-status-success/15 text-status-success",
  },
  active: { label: "Active", className: "bg-status-success/15 text-status-success" },
  rented: { label: "Rented", className: "bg-status-success/15 text-status-success" },
  returned: { label: "Returned", className: "bg-status-success/15 text-status-success" },
  completed: { label: "Completed", className: "bg-status-success/15 text-status-success" },
  rejected: { label: "Rejected", className: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
  hidden: { label: "Paused", className: "bg-muted text-muted-foreground" },
  disputed: { label: "Disputed", className: "bg-destructive/15 text-destructive" },
  maintenance: { label: "Maintenance", className: "bg-destructive/15 text-destructive" },
};

export function StatusPill({
  status,
  className,
}: {
  status: ProductStatus | BookingStatus;
  className?: string;
}) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium",
        style.className,
        className,
      )}
    >
      {style.label}
    </span>
  );
}
