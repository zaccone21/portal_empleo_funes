"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

/**
 * Footer of the sidebar: who is logged in and the sign-out action. When the
 * sidebar is collapsed only the icon button stays, with a tooltip.
 */
export function NavUser({ email }: { email: string }) {
  const enrutador = useRouter();

  async function cerrarSesion() {
    await fetch("/api/auth/salida", { method: "POST" });
    enrutador.push("/");
    enrutador.refresh();
  }

  return (
    <div className="mt-auto flex flex-col gap-1 border-t border-border px-2 pt-2.5 text-[11.5px] text-muted-foreground group-data-[collapsible=icon]:border-t-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pt-0">
      <div className="flex flex-col group-data-[collapsible=icon]:hidden">
        <span>Operador</span>
        <span className="truncate" title={email}>
          {email}
        </span>
      </div>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Cerrar sesión"
            onClick={cerrarSesion}
            className="h-auto gap-[9px] rounded-[7px] px-2 py-[7px] text-[12.5px] font-semibold text-foreground group-data-[collapsible=icon]:px-2"
          >
            <LogOut className="size-4 opacity-60" aria-hidden="true" />
            <span>Cerrar sesión</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
}
