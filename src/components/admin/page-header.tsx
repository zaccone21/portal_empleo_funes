import type { ReactNode } from "react";

import { SidebarTrigger } from "@/components/ui/sidebar";

type Props = {
  /** Breadcrumb segments, for example ["Gestión", "Ofertas"] (shown as "Gestión › Ofertas"). */
  migas?: string[];
  titulo: ReactNode;
  /** Right side: auxiliary text (13 px) or a badge. */
  aside?: ReactNode;
  accion?: ReactNode;
  descripcion?: string;
  conPatron?: boolean;
};

/**
 * Page header of the Office (D-037): breadcrumb, 20 px title and an optional
 * right-hand note. No background, border or pattern. It also holds the sidebar
 * toggle, so the menu can be opened on phones and collapsed on desktop.
 */
export function PageHeader({ migas, titulo, aside, accion, descripcion }: Props) {
  return (
    <header className="flex items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <SidebarTrigger className="-ml-1 size-6 text-muted-foreground" />
          {migas && migas.length > 0 && (
            <nav aria-label="Ruta" className="text-[11px] text-muted-foreground">
              {migas.join(" › ")}
            </nav>
          )}
        </div>
        <h1 className="mt-0.5 font-heading text-[20px] leading-tight font-bold tracking-[-0.015em] text-foreground">
          {titulo}
        </h1>
        {descripcion && <p className="text-[12.5px] text-muted-foreground mt-0.5">{descripcion}</p>}
      </div>
      {(aside || accion) && (
        <div className="shrink-0 text-[13px] text-muted-foreground tabular-nums flex items-center gap-2">
          {aside}
          {accion}
        </div>
      )}
    </header>
  );
}
