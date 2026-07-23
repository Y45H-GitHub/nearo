import Link from "next/link";
import { StatTile } from "@/features/owner-dashboard/components/stat-tile";
import { getAdminSnapshot } from "@/features/admin/queries";

export default async function AdminDashboardPage() {
  const snapshot = await getAdminSnapshot();

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Dashboard</h1>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="New users (7d)" value={String(snapshot.newUsers7d)} />
        <StatTile label="New listings (7d)" value={String(snapshot.newListings7d)} />
        <StatTile label="Bookings in flight" value={String(snapshot.bookingsInFlight)} />
        <StatTile label="Open reports" value={String(snapshot.openReports)} />
      </div>

      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent activity</h2>
          <Link href="/admin/reports" className="text-sm text-foreground underline underline-offset-4">
            Open reports queue →
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {snapshot.recentBookings.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
              <span className="text-foreground">{b.product_title}</span>
              <span className="text-muted-foreground">{b.status}</span>
            </div>
          ))}
          {snapshot.recentBookings.length === 0 && (
            <p className="text-sm text-muted-foreground">No bookings yet.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Recent reports</h2>
        <div className="flex flex-col gap-2">
          {snapshot.recentReports.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
              <span className="text-foreground">{r.reason}</span>
              <span className="text-muted-foreground">{r.status}</span>
            </div>
          ))}
          {snapshot.recentReports.length === 0 && (
            <p className="text-sm text-muted-foreground">No reports yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
