"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
                  const activo = item.url === "/admin" 
                    ? rutaActual === "/admin" 
                    : rutaActual === item.url || rutaActual.startsWith(item.url + "/");
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
