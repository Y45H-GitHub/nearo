import { redirect } from "next/navigation";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { StatTile } from "@/features/owner-dashboard/components/stat-tile";
import { PendingRequestsList } from "@/features/owner-dashboard/components/pending-requests-list";
import { UpcomingRentalsList } from "@/features/owner-dashboard/components/upcoming-rentals-list";
import { getOwnerDashboard } from "@/features/owner-dashboard/queries";
import { getOwnProfile } from "@/features/auth/queries";

export default async function OwnerDashboardPage() {
  const own = await getOwnProfile();
  if (!own?.profile) redirect("/login?redirect=/owner");

  const stats = await getOwnerDashboard();
  if (!stats) redirect("/login?redirect=/owner");

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <Link href="/owner/earnings" className="text-sm text-foreground underline underline-offset-4">
          View earnings →
        </Link>
      </div>

      {!stats.hasAnyListings ? (
        <EmptyState
          title="List your first item in under 5 minutes"
          description="Add photos, set a price, and start renting out to people nearby."
          actionLabel="Create a listing"
          actionHref="/owner/listings/new"
        />
      ) : (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Active listings" value={String(stats.activeListingsCount)} />
          <StatTile label="Pending requests" value={String(stats.pendingRequestsCount)} />
          <StatTile label="This month" value={`₹${stats.thisMonthEarnings.toLocaleString("en-IN")}`} />
          <StatTile label="Rating" value={stats.ratingCount > 0 ? `★ ${stats.ratingAvg.toFixed(1)}` : "—"} />
        </div>
      )}

      <div className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Pending requests</h2>
        <PendingRequestsList bookings={stats.pendingRequests} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Upcoming rentals</h2>
        <UpcomingRentalsList bookings={stats.upcomingRentals} />
      </div>
    </div>
  );
}
