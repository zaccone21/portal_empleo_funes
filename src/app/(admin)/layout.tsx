import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";

import { AppSidebar } from "@/components/admin/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/dal/auth";
import { getConteosAdmin } from "@/lib/use-cases/oficina";

/**
 * Shell of the Employment Office's screens (D-030, D-037): a 232 px sidebar
 * (56 px when collapsed, state kept in a cookie) and the content column.
 * Each screen owns its header and fills the remaining height.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const usuario = await getCurrentUser();
  if (!usuario || usuario.rol !== "admin") {
    redirect("/admin/ingresar");
  }

  const [conteos, almacen] = await Promise.all([getConteosAdmin(usuario), cookies()]);
  const abierto = almacen.get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider
      defaultOpen={abierto}
      style={{ "--sidebar-width": "232px", "--sidebar-width-icon": "56px" } as CSSProperties}
    >
      <AppSidebar conteos={conteos} emailUsuario={usuario.email} />
      <main className="flex min-h-svh min-w-0 flex-1 flex-col gap-3 px-[22px] py-3.5 text-[13px] md:h-svh md:overflow-hidden">
        {children}
      </main>
    </SidebarProvider>
  );
}
