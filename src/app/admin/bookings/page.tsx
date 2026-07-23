import { StatusPill } from "@/components/shared/status-pill";
import { DisputeResolutionForm } from "@/features/admin/components/dispute-resolution-form";
import { getAdminBookings } from "@/features/admin/queries";
import type { BookingStatus } from "@/types/domain";

export default async function AdminBookingsPage() {
  const bookings = await getAdminBookings();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Bookings</h1>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="p-3 font-medium">Listing</th>
              <th className="p-3 font-medium">Customer</th>
              <th className="p-3 font-medium">Owner</th>
              <th className="p-3 font-medium">Dates</th>
              <th className="p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-border last:border-0 align-top">
                <td className="p-3 whitespace-nowrap">{b.product_title}</td>
                <td className="p-3 whitespace-nowrap">{b.customer_name}</td>
                <td className="p-3 whitespace-nowrap">{b.owner_name}</td>
                <td className="p-3 whitespace-nowrap text-muted-foreground">
                  {b.start_date} → {b.end_date}
                </td>
                <td className="p-3">
                  <div className="flex flex-col gap-2">
                    <StatusPill status={b.status as BookingStatus} />
                    {b.status === "disputed" && <DisputeResolutionForm bookingId={b.id} />}
                    {b.admin_notes && (
                      <p className="max-w-xs text-xs text-muted-foreground">Note: {b.admin_notes}</p>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">No bookings yet.</p>
        )}
      </div>
    </div>
  );
}
