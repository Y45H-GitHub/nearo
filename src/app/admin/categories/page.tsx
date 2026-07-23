import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/features/admin/components/data-table";
import { CategoryFormDialog } from "@/features/admin/components/category-form-dialog";
import { getAdminCategories, type AdminCategoryRow } from "@/features/admin/queries";
import { toggleCategoryActive } from "@/features/admin/actions";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();
  const parentOptions = categories
    .filter((c) => !c.parent_id)
    .map((c) => ({ id: c.id, name: c.name }));
  const nameById = new Map(categories.map((c) => [c.id, c.name]));

  const columns: DataTableColumn<AdminCategoryRow>[] = [
    { key: "name", label: "Name", render: (c) => c.name },
    { key: "slug", label: "Slug", render: (c) => c.slug },
    { key: "parent", label: "Parent", render: (c) => (c.parent_id ? nameById.get(c.parent_id) ?? "—" : "—") },
    { key: "sort", label: "Sort", render: (c) => String(c.sort_order) },
    { key: "active", label: "Active", render: (c) => (c.is_active ? "Yes" : "No") },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (c) => {
        async function toggle() {
          "use server";
          await toggleCategoryActive(c.id, !c.is_active);
        }
        return (
          <div className="flex justify-end gap-2">
            <CategoryFormDialog
              category={c}
              parentOptions={parentOptions}
              trigger={
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              }
            />
            <form action={toggle}>
              <Button type="submit" size="sm" variant={c.is_active ? "destructive" : "outline"}>
                {c.is_active ? "Deactivate" : "Activate"}
              </Button>
            </form>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Categories</h1>
        <CategoryFormDialog
          parentOptions={parentOptions}
          trigger={<Button size="sm">Add category</Button>}
        />
      </div>
      <DataTable columns={columns} rows={categories} emptyMessage="No categories yet." />
    </div>
  );
}
