import Link from "next/link";

import { cn } from "@/lib/utils";
import type { EstadoOferta } from "@/lib/validation/ofertas";

export const ORDEN_PESTANAS: EstadoOferta[] = ["pending", "published", "rejected", "closed"];

const NOMBRE_PESTANA: Record<EstadoOferta, string> = {
  pending: "Pendientes",
  published: "Publicadas",
  rejected: "Rechazadas",
  closed: "Cerradas",
};

type Props = {
  actual: EstadoOferta;
  /** How many offers each status has, shown next to its name. */
  cantidades: Record<EstadoOferta, number>;
};

/**
 * The offers split by status (RF1.5.2): Pendientes, Publicadas, Rechazadas
 * and Cerradas. They are links (/admin/ofertas?estado=…), not a tabs widget:
 * the status is in the URL, so the back button, reloading and the panel's
 * shortcuts all land on the right one. The current one is marked with
 * aria-current and the green fill; the row scrolls sideways on phones.
 */
export function PestanasEstado({ actual, cantidades }: Props) {
  return (
    <nav aria-label="Ofertas por estado" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
      <ul className="flex w-max gap-2 pb-1">
        {ORDEN_PESTANAS.map((estado) => (
          <li key={estado}>
            <Link
              href={`/admin/ofertas?estado=${estado}`}
              scroll={false}
              aria-current={estado === actual ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full border border-input bg-background px-4 text-base whitespace-nowrap outline-none",
                "hover:border-primary focus-visible:ring-3 focus-visible:ring-ring/50",
                "aria-[current=page]:border-primary aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground",
              )}
            >
              {NOMBRE_PESTANA[estado]}
              <span className="rounded-full bg-foreground/10 px-2 text-sm tabular-nums">{cantidades[estado]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
