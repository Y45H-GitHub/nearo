import type { ReactNode } from "react";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-65px)]">
      <AdminSidebar />
      <div className="flex-1 overflow-x-auto px-8 py-8">{children}</div>
    </div>
  );
}
