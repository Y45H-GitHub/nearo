import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/shared/status-pill";
import { DataTable, type DataTableColumn } from "@/features/admin/components/data-table";
import { getAdminListings, type AdminListingRow } from "@/features/admin/queries";
import { hideListing } from "@/features/admin/actions";
import type { ProductStatus } from "@/types/domain";

export default async function AdminListingsPage() {
  const listings = await getAdminListings();

  const columns: DataTableColumn<AdminListingRow>[] = [
    { key: "title", label: "Title", render: (l) => l.title },
    { key: "owner", label: "Owner", render: (l) => l.owner_name },
    { key: "status", label: "Status", render: (l) => <StatusPill status={l.status as ProductStatus} /> },
    {
      key: "price",
      label: "Price/day",
      align: "right",
      render: (l) => `₹${l.price_per_day.toLocaleString("en-IN")}`,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (l) => {
        const isHidden = l.status === "hidden";
        async function toggle() {
          "use server";
          await hideListing(l.id, !isHidden);
        }
        return (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href={`/listing/${l.id}`}>View</Link>
            </Button>
            <form action={toggle}>
              <Button type="submit" size="sm" variant={isHidden ? "outline" : "destructive"}>
                {isHidden ? "Unhide" : "Hide"}
              </Button>
            </form>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Listings</h1>
      <DataTable columns={columns} rows={listings} emptyMessage="No listings yet." />
    </div>
  );
}
