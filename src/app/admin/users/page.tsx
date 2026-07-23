import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { DataTable, type DataTableColumn } from "@/features/admin/components/data-table";
import { getAdminUsers, type AdminUserRow } from "@/features/admin/queries";
import { suspendUser } from "@/features/admin/actions";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  const columns: DataTableColumn<AdminUserRow>[] = [
    { key: "name", label: "Name", render: (u) => u.full_name || "—" },
    { key: "email", label: "Email", render: (u) => u.email ?? "—" },
    {
      key: "verified",
      label: "Verified",
      render: (u) => <VerifiedBadge verified={Boolean(u.phone_verified_at)} />,
    },
    { key: "role", label: "Role", render: (u) => u.role },
    {
      key: "joined",
      label: "Joined",
      render: (u) => new Date(u.created_at).toLocaleDateString("en-IN"),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (u) => {
        async function toggle() {
          "use server";
          await suspendUser(u.id, !u.is_suspended);
        }
        return (
          <form action={toggle}>
            <Button type="submit" size="sm" variant={u.is_suspended ? "outline" : "destructive"}>
              {u.is_suspended ? "Unsuspend" : "Suspend"}
            </Button>
          </form>
        );
      },
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Users</h1>
      <DataTable columns={columns} rows={users} emptyMessage="No users yet." />
    </div>
  );
}
