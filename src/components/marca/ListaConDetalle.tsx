"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  /** The person picked an item (it is in the URL). */
  eligio: boolean;
  /** One sentence above the list, for example "Hay 5 ofertas publicadas."; it also names the list. */
  resumen: string;
  /** A shortcut next to the summary, for example "Publicar oferta" in the company list. */
  accion?: ReactNode;
  /** The list items, each one a <li>. */
  children: ReactNode;
  /** The detail panel (or a notice when the chosen item no longer exists). */
  detalle: ReactNode;
  /** Key identifying the selected item so detail cross-fades smoothly between items. */
  detalleKey?: string;
  /** Classes defining the two-column grid proportions on desktop. */
  columnasClase?: string;
  /** Componente opcional al pie de la columna de listado (ej: paginador). */
  pieLista?: ReactNode;
};

/**
 * Layout of a list with the detail on the same page, like job boards do
 * (D-025, Computrabajo / Indeed style).
 *
 * - Desktop (`lg`):
 *   - The left column (`section`) has an independently scrollable list of cards (`ul`
 *     with `overflow-y-auto`), decoupling the card scroll from the detail.
 *   - The right column (`div`) stays IMMOBILE (`h-full min-h-0`), with its header/title
 *     permanently visible and internal scroll for content.
 * - Phone: without a choice only the list is visible; with a choice only the
 *   detail (which has its own "Volver").
 */
export function ListaConDetalle({
  eligio,
  resumen,
  accion,
  children,
  detalle,
  columnasClase = "lg:grid-cols-[minmax(350px,420px)_minmax(0,1fr)]",
  pieLista,
}: Props) {
  return (
    <div className={cn("grid gap-5 lg:gap-6 lg:h-full lg:min-h-0 lg:items-stretch", columnasClase)}>
      <section
        aria-labelledby="lista-resumen"
        className={cn(
          "flex flex-col gap-2.5 lg:h-full lg:min-h-0",
          eligio && "hidden lg:flex"
        )}
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
          <p
            id="lista-resumen"
            className="text-base text-muted-foreground font-medium"
          >
            {resumen}
          </p>
          {accion}
        </div>
        <ul className="relative flex flex-1 min-h-0 flex-col gap-2.5 p-1 lg:overflow-y-auto lg:px-1.5 lg:py-1.5 lg:pr-2 lg:pb-6 [scrollbar-width:thin] [scrollbar-gutter:stable]">
          {children}
        </ul>
        {pieLista && (
          <div className="shrink-0 border-t border-border/40 bg-card/60 backdrop-blur-xs rounded-b-xl px-2 py-1">
            {pieLista}
          </div>
        )}
      </section>

      <div
        className={cn(
          "lg:h-full lg:min-h-0",
          eligio ? "block" : "hidden lg:block"
        )}
      >
        {detalle}
      </div>
    </div>
  );
}
