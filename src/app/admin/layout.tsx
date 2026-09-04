import type { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

// Wraps every /admin/* page with the sidebar. Access itself is already
// enforced by src/middleware.ts (role must be "admin"), so this layout
// only handles the shared visual shell.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-beige">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}