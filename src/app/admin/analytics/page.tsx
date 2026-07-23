import { StatTile } from "@/features/owner-dashboard/components/stat-tile";
import { getAdminAnalytics } from "@/features/admin/queries";

export default async function AdminAnalyticsPage() {
  const analytics = await getAdminAnalytics();
  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-foreground">Analytics</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Counts and trends only — no BI tooling in MVP (see mvp-scope.md).
      </p>

      <div className="mb-8 grid grid-cols-3 gap-3">
        <StatTile label="Signups (14d)" value={String(sum(analytics.signups))} />
        <StatTile label="Listings (14d)" value={String(sum(analytics.listings))} />
        <StatTile label="Bookings (14d)" value={String(sum(analytics.bookings))} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="p-3 font-medium">Day</th>
              <th className="p-3 text-right font-medium">Signups</th>
              <th className="p-3 text-right font-medium">Listings</th>
              <th className="p-3 text-right font-medium">Bookings</th>
            </tr>
          </thead>
          <tbody>
            {analytics.days.map((day, i) => (
              <tr key={day} className="border-b border-border last:border-0">
                <td className="p-3 whitespace-nowrap">{day}</td>
                <td className="p-3 text-right">{analytics.signups[i]}</td>
                <td className="p-3 text-right">{analytics.listings[i]}</td>
                <td className="p-3 text-right">{analytics.bookings[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
