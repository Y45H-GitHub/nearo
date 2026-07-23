import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/features/admin/components/data-table";
import { getAdminReports, type AdminReportRow } from "@/features/admin/queries";
import { resolveReport } from "@/features/admin/actions";

export default async function AdminReportsPage() {
  const reports = await getAdminReports();

  const columns: DataTableColumn<AdminReportRow>[] = [
    { key: "target", label: "Target", render: (r) => `${r.target_type} · ${r.target_id.slice(0, 8)}` },
    { key: "reporter", label: "Reporter", render: (r) => r.reporter_name },
    { key: "reason", label: "Reason", render: (r) => r.reason },
    { key: "status", label: "Status", render: (r) => r.status },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (r) => {
        if (!["open", "reviewing"].includes(r.status)) return null;

        async function resolve() {
          "use server";
          await resolveReport(r.id, "resolved");
        }
        async function dismiss() {
          "use server";
          await resolveReport(r.id, "dismissed");
        }

        return (
          <div className="flex justify-end gap-2">
            <form action={resolve}>
              <Button type="submit" size="sm">
                Resolve
              </Button>
            </form>
            <form action={dismiss}>
              <Button type="submit" size="sm" variant="outline">
                Dismiss
              </Button>
            </form>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Reports</h1>
      <DataTable columns={columns} rows={reports} emptyMessage="No reports yet." />
    </div>
  );
}
