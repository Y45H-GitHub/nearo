import { redirect } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";
import { EarningsTable } from "@/features/owner-dashboard/components/earnings-table";
import { getOwnerEarnings } from "@/features/owner-dashboard/queries";
import { getOwnProfile } from "@/features/auth/queries";

export default async function OwnerEarningsPage() {
  const own = await getOwnProfile();
  if (!own?.profile) redirect("/login?redirect=/owner/earnings");

  const { rows, totalNet } = await getOwnerEarnings();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-2 text-2xl font-semibold text-foreground">Earnings</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Mock figures — no real money moves yet (see ADR 0001 and ADR 0005).
      </p>

      <div className="mb-6 rounded-lg border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Total net payout</p>
        <p className="text-3xl font-semibold text-foreground">₹{totalNet.toLocaleString("en-IN")}</p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No earnings yet"
          description="Accepted bookings will show up here with the gross, fee, and net payout."
        />
      ) : (
        <EarningsTable rows={rows} />
      )}
    </div>
  );
}
