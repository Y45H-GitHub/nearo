import Link from "next/link";
import { StatusPill } from "@/components/shared/status-pill";
import type { EarningsRow } from "@/features/owner-dashboard/queries";

export function EarningsTable({ rows }: { rows: EarningsRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="p-3 font-medium">Listing</th>
            <th className="p-3 font-medium">Dates</th>
            <th className="p-3 font-medium">Status</th>
            <th className="p-3 text-right font-medium">Gross</th>
            <th className="p-3 text-right font-medium">Platform fee</th>
            <th className="p-3 text-right font-medium">Net payout</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-border last:border-0">
              <td className="p-3">
                <Link href={`/bookings/${r.id}`} className="text-foreground underline underline-offset-4">
                  {r.products?.title ?? "Listing"}
                </Link>
              </td>
              <td className="p-3 whitespace-nowrap text-muted-foreground">
                {r.start_date} → {r.end_date}
              </td>
              <td className="p-3">
                <StatusPill status={r.status} />
              </td>
              <td className="p-3 text-right whitespace-nowrap text-foreground">
                ₹{r.subtotal_amount.toLocaleString("en-IN")}
              </td>
              <td className="p-3 text-right whitespace-nowrap text-muted-foreground">
                −₹{(r.platform_fee_amount ?? 0).toLocaleString("en-IN")}
              </td>
              <td className="p-3 text-right whitespace-nowrap font-medium text-foreground">
                ₹{(r.owner_payout_amount ?? 0).toLocaleString("en-IN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
