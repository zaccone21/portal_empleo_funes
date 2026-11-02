"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";

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
  useSidebar,
} from "@/components/ui/sidebar";
import { itemActivo, MENU_ADMIN, type ConteoMenu } from "@/features/navegacion/config";
import { cn } from "@/lib/utils";

import { NavUser } from "./nav-user";

type Props = {
  conteos: Record<ConteoMenu, number>;
  emailUsuario: string;
};

/**
 * Sidebar of the Office (D-042):
 * - Prominent collapse/expand button located directly on the top of the panel itself.
 * - Clear visual hierarchy distinguishing section headers, icon tiles, and active items.
 */
export function AppSidebar({ conteos, emailUsuario }: Props) {
  const activo = itemActivo(usePathname());
  const { state, toggleSidebar } = useSidebar();
  const colapsado = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card">
      <SidebarHeader className="border-b border-border/80 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-1 group-data-[collapsible=icon]:hidden">
            <LogoMunicipalidad variante="color" className="h-7 w-auto self-start" />
            <span className="font-heading text-[13.5px] leading-tight font-bold text-foreground">
              Oficina de Empleo
            </span>
          </div>

          <button
            type="button"
            onClick={toggleSidebar}
            title={colapsado ? "Expandir panel lateral (Ctrl+B)" : "Reducir panel lateral (Ctrl+B)"}
            aria-label={colapsado ? "Expandir panel lateral" : "Reducir panel lateral"}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary/25 bg-secondary px-2.5 py-2 text-xs font-semibold text-primary shadow-2xs transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring outline-none",
              colapsado ? "mx-auto size-9 p-0" : "shrink-0",
            )}
          >
            {colapsado ? (
              <PanelLeftOpenIcon className="size-4" aria-hidden="true" />
            ) : (
              <>
                <PanelLeftCloseIcon className="size-4" aria-hidden="true" />
                <span className="text-[11.5px]">Reducir</span>
              </>
            )}
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-1 overflow-hidden px-2.5 py-2">
        {MENU_ADMIN.map((grupo, idx) => (
          <SidebarGroup
            key={grupo.titulo}
            className={cn(
              "p-0",
              idx > 0 && "border-t border-border/60 pt-1.5 group-data-[collapsible=icon]:border-t group-data-[collapsible=icon]:pt-1.5",
            )}
          >
            <SidebarGroupLabel className="mb-0.5 h-auto px-2 py-0.5 font-heading text-[11px] font-bold tracking-[0.08em] text-primary uppercase group-data-[collapsible=icon]:hidden">
              {grupo.titulo}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {grupo.items.map((item) => {
                  const cantidad = item.idConteo ? conteos[item.idConteo] : 0;
                  const esActivo = activo?.url === item.url;
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        render={<Link href={item.url} />}
                        isActive={esActivo}
                        tooltip={item.titulo}
                        className={cn(
                          "h-8 gap-2.5 rounded-lg px-2 py-0 text-[13px] font-medium transition-all [@media(max-height:760px)]:h-7",
                          esActivo
                            ? "bg-brand-deep font-semibold text-primary-foreground shadow-2xs hover:bg-brand-deep/95"
                            : "text-foreground/85 hover:bg-secondary/70 hover:text-foreground",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-md transition-colors",
                            esActivo
                              ? "bg-brand-mint text-brand-deep"
                              : "bg-muted text-primary group-hover/menu-button:bg-secondary",
                          )}
                        >
                          <item.icono className="size-4" />
                        </span>
                        <span className="truncate">{item.titulo}</span>
                        {cantidad > 0 && (
                          <span
                            className={cn(
                              "ml-auto shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums group-data-[collapsible=icon]:hidden",
                              esActivo
                                ? "bg-brand-mint text-brand-deep"
                                : "bg-attention text-attention-foreground",
                            )}
                          >
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

      <SidebarFooter className="border-t border-border/80 px-2.5 py-2">
        <NavUser email={emailUsuario} />
      </SidebarFooter>
    </Sidebar>
  );
}
