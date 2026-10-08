"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { MENU_ADMIN } from "@/features/navegacion/config";

import { NavUser } from "./nav-user";

type Props = {
  conteos: {
    ofertasPendientes: number;
    postulacionesNuevas: number;
    cierresSolicitados: number;
    porDerivar: number;
  };
  emailUsuario: string;
};

import { LogoMunicipalidad } from "@/components/marca/LogoMunicipalidad";

export function AppSidebar({ conteos, emailUsuario }: Props) {
  const rutaActual = usePathname();
  const parametros = useSearchParams();
  const queryStr = parametros.toString();
  const urlActualCompleta = queryStr ? `${rutaActual}?${queryStr}` : rutaActual;

  return (
    <Sidebar variant="inset" className="bg-primary/5">
      <SidebarHeader>
        <div className="flex flex-col gap-4 px-4 py-4 border-b border-primary/10 mb-2">
          <LogoMunicipalidad variante="color" className="h-6 w-auto object-contain" />
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-primary text-sm uppercase tracking-wide">Oficina de Empleo</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {MENU_ADMIN.map((grupo) => (
          <SidebarGroup key={grupo.titulo}>
            <SidebarGroupLabel>{grupo.titulo}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {grupo.items.map((item) => {
                  let activo = false;
                  if (item.url === "/admin") {
                    activo = urlActualCompleta === "/admin";
                  } else if (item.url.includes("?")) {
                    activo = urlActualCompleta === item.url;
                  } else {
                    // For base routes like /admin/ofertas, we want it active on exact match 
                    // or subroutes, BUT only if it's the exact same menu item (since multiple items point to /admin/ofertas).
                    // This is tricky if multiple links go to the same base url.
                    // For now, require exact match if there's multiple, or just let them be highlighted.
                    // Actually, if urlActualCompleta === item.url, it's a direct match.
                    activo = urlActualCompleta === item.url || (rutaActual.startsWith(item.url + "/") && queryStr === "");
                  }
                  const cantidad = item.idConteo ? conteos[item.idConteo] : undefined;
                  return (
                    <SidebarMenuItem key={item.titulo}>
                      <SidebarMenuButton 
                        render={<Link href={item.url} />} 
                        isActive={activo} 
                        tooltip={item.titulo}
                      >
                        <item.icono className="size-4" />
                        <span>{item.titulo}</span>
                      </SidebarMenuButton>
                      {cantidad !== undefined && cantidad > 0 && (
                        <SidebarMenuBadge>{cantidad}</SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser email={emailUsuario} />
      </SidebarFooter>
    </Sidebar>
  );
}
