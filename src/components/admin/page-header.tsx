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
 * Page header of the Office (D-042): clear typographic hierarchy with breadcrumb,
 * bold heading, optional description, and mobile sidebar trigger (on desktop the
 * collapse button sits directly on the sidebar panel).
 */
export function PageHeader({ migas, titulo, aside, accion, descripcion }: Props) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border/80 pb-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1 size-7 text-primary md:hidden" />
          {migas && migas.length > 0 && (
            <nav aria-label="Ruta" className="text-[11.5px] font-semibold tracking-wide text-primary uppercase">
              {migas.join(" › ")}
            </nav>
          )}
        </div>
        <h1 className="mt-0.5 font-heading text-2xl leading-tight font-bold tracking-[-0.02em] text-foreground">
          {titulo}
        </h1>
        {descripcion && (
          <p className="mt-1 max-w-3xl text-[13px] text-muted-foreground">{descripcion}</p>
        )}
      </div>
      {(aside || accion) && (
        <div className="flex shrink-0 items-center gap-2 text-[13px] font-medium text-muted-foreground tabular-nums">
          {aside}
          {accion}
        </div>
      )}
    </header>
  );
}
