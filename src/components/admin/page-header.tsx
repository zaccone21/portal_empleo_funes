import type { ReactNode } from "react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type Props = {
  /** Breadcrumb segments, for example ["Gestión", "Ofertas"] (shown as "Gestión › Ofertas"). */
  migas?: string[];
  titulo: ReactNode;
  /** Right side: auxiliary text (13 px) or a badge. */
  aside?: ReactNode;
  accion?: ReactNode;
  descripcion?: string;
  conPatron?: boolean;
  compacto?: boolean;
};

/**
 * Page header of the Office (D-042): clear typographic hierarchy with breadcrumb,
 * bold heading, optional description, and mobile sidebar trigger (on desktop the
 * collapse button sits directly on the sidebar panel).
 */
export function PageHeader({
  migas,
  titulo,
  aside,
  accion,
  descripcion,
  compacto = false,
}: Props) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-end justify-between gap-3 border-b border-border/80",
        compacto ? "pb-2" : "pb-3",
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1 size-7 text-primary md:hidden" />
          {migas && migas.length > 0 && (
            <nav
              aria-label="Ruta"
              className={cn(
                "font-semibold tracking-wide text-primary uppercase",
                compacto ? "text-[11px]" : "text-[11.5px]",
              )}
            >
              {migas.join(" › ")}
            </nav>
          )}
        </div>
        <h1
          className={cn(
            "font-heading font-bold tracking-[-0.02em] text-foreground",
            compacto ? "mt-0 text-xl leading-tight" : "mt-0.5 text-2xl leading-tight",
          )}
        >
          {titulo}
        </h1>
        {descripcion && (
          <p
            className={cn(
              "text-muted-foreground",
              compacto ? "mt-0.5 max-w-2xl text-[12px]" : "mt-1 max-w-3xl text-[13px]",
            )}
          >
            {descripcion}
          </p>
        )}
      </div>
      {(aside || accion) && (
        <div
          className={cn(
            "flex shrink-0 items-center gap-2 font-medium text-muted-foreground tabular-nums",
            compacto ? "text-[12px]" : "text-[13px]",
          )}
        >
          {aside}
          {accion}
        </div>
      )}
    </header>
  );
}
