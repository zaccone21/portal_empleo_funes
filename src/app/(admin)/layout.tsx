import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";

import { AppSidebar } from "@/components/admin/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/dal/auth";
import { getConteosAdmin } from "@/lib/use-cases/oficina";

/**
 * Shell of the Employment Office's screens (D-030, D-042): a 244 px sidebar
 * (60 px when collapsed, state kept in a cookie) and a full-width, full-height
 * scrollable content column so long views like the Calendar or Metrics never
 * get clipped at the bottom of the screen.
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
      style={{ "--sidebar-width": "244px", "--sidebar-width-icon": "60px" } as CSSProperties}
    >
      <AppSidebar conteos={conteos} emailUsuario={usuario.email} />
      <main className="flex min-h-svh w-full min-w-0 flex-1 flex-col gap-4 px-4 py-4 text-[13px] sm:px-6 md:h-svh md:overflow-y-auto print:h-auto print:overflow-visible">
        {children}
      </main>
    </SidebarProvider>
  );
}
