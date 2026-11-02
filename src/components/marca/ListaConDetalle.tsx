"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

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
};

/**
 * Layout of a list with the detail on the same page, like job boards do
 * (D-025, Computrabajo style).
 *
 * - Desktop (`lg`):
 *   - The left column (`section`) has an independently scrollable list of cards (`ul`
 *     with `overflow-y-auto`), decoupling the card scroll from the detail.
 *   - The right column (`div`) stays IMMOBILE (`h-full min-h-0`), with its header/title
 *     permanently visible and internal scroll for content.
 * - Phone: without a choice only the list is visible; with a choice only the
 *   detail (which has its own "Volver").
 */
export function ListaConDetalle({ eligio, resumen, accion, children, detalle, detalleKey }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:h-full lg:min-h-0 lg:items-stretch">
      <section
        aria-labelledby="lista-resumen"
        className={cn(
          "flex flex-col gap-2.5 lg:h-full lg:min-h-0",
          eligio && "hidden lg:flex"
        )}
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={resumen}
              id="lista-resumen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-base text-muted-foreground font-medium"
            >
              {resumen}
            </motion.p>
          </AnimatePresence>
          {accion}
        </div>
        <ul className="relative flex flex-1 min-h-0 flex-col gap-3 lg:overflow-y-auto lg:pr-2 lg:pb-6 [scrollbar-width:thin] [scrollbar-gutter:stable]">
          {children}
        </ul>
      </section>

      <div
        className={cn(
          "lg:h-full lg:min-h-0",
          eligio ? "block" : "hidden lg:block"
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={detalleKey ?? (eligio ? "seleccionado" : "vacio")}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="h-full min-h-0"
          >
            {detalle}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
