"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoMunicipalidad } from "@/components/marca/LogoMunicipalidad";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { itemActivo, MENU_ADMIN, type ConteoMenu } from "@/features/navegacion/config";

import { NavUser } from "./nav-user";

type Props = {
  conteos: Record<ConteoMenu, number>;
  emailUsuario: string;
};

/**
 * Sidebar of the Office (D-042): 232 px, collapsible to a 56 px icon rail,
 * group labels, one active item and attention counters that only show when
 * the value is greater than 0.
 */
export function AppSidebar({ conteos, emailUsuario }: Props) {
  const activo = itemActivo(usePathname());

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="px-2.5 pt-3.5 pb-0 group-data-[collapsible=icon]:hidden">
        <div className="flex flex-col gap-1.5 px-2 pt-0.5 pb-3">
          <LogoMunicipalidad variante="color" className="h-[30px] w-auto self-start" />
          <div className="flex flex-col gap-px">
            <span className="font-heading text-[14px] leading-[1.15] font-bold text-foreground">Oficina de Empleo</span>
            <span className="text-[10.5px] text-muted-foreground">Municipalidad de Funes</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2.5 group-data-[collapsible=icon]:pt-3.5">
        {MENU_ADMIN.map((grupo) => (
          <SidebarGroup key={grupo.titulo} className="p-0">
            <SidebarGroupLabel className="h-auto px-2 pt-3 pb-1 text-[10px] font-medium tracking-[0.09em] text-muted-foreground uppercase">
              {grupo.titulo}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-px">
                {grupo.items.map((item) => {
                  const cantidad = item.idConteo ? conteos[item.idConteo] : 0;
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        render={<Link href={item.url} />}
                        isActive={activo?.url === item.url}
                        tooltip={item.titulo}
                        className="h-auto gap-[9px] rounded-[7px] px-2 py-[7px] text-[13px] text-sidebar-foreground hover:bg-sidebar-accent/50 data-active:font-semibold data-active:hover:bg-sidebar-accent [&_svg]:opacity-60 data-active:[&_svg]:opacity-100"
                      >
                        <item.icono className="size-4" aria-hidden="true" />
                        <span>{item.titulo}</span>
                        {cantidad > 0 && (
                          <span className="ml-auto shrink-0 rounded-full bg-attention px-[7px] text-[11px] font-bold text-attention-foreground tabular-nums group-data-[collapsible=icon]:hidden">
                            {cantidad}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="px-2.5 pb-3.5">
        <NavUser email={emailUsuario} />
      </SidebarFooter>
    </Sidebar>
  );
}
