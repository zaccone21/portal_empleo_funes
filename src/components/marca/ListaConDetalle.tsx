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
};

/**
 * Layout of a list with the detail on the same page, like job boards do
 * (D-025). Used by the public offers (P05/P06) and the company's offers (P12).
 *
 * - Desktop (`lg`): list on the left, detail on the right, sticky while the
 *   list scrolls.
 * - Phone: without a choice only the list is visible; with a choice only the
 *   detail (which has its own "Volver").
 * Both areas are always in the DOM and CSS decides which one shows per screen
 * size, so nothing depends on measuring the screen in JavaScript.
 */
export function ListaConDetalle({ eligio, resumen, accion, children, detalle }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
      <section aria-labelledby="lista-resumen" className={cn("flex flex-col gap-3", eligio && "hidden lg:flex")}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p id="lista-resumen" className="text-base text-muted-foreground">
            {resumen}
          </p>
          {accion}
        </div>
        <ul className="flex flex-col gap-3">{children}</ul>
      </section>
      <div className={cn("lg:sticky lg:top-4", eligio ? "block" : "hidden lg:block")}>{detalle}</div>
    </div>
  );
}
