import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppSidebar } from "@/components/admin/app-sidebar";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/dal/auth";
import { getConteosAdmin } from "@/lib/use-cases/oficina";

/**
 * Shell of the Employment Office's screens (P14, P15; D-030).
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const usuario = await getCurrentUser();
  if (!usuario || usuario.rol !== "admin") {
    redirect("/acceso/admin");
  }

  const conteos = await getConteosAdmin(usuario);

  return (
    <SidebarProvider>
      <AppSidebar conteos={conteos} emailUsuario={usuario.email} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <AdminBreadcrumb />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6 w-full max-w-[1600px] mx-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
