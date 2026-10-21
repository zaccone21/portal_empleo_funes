import Link from "next/link";

import { IconoRubro } from "@/components/ofertas/IconoRubro";
import type { OfertaPublica } from "@/lib/validation/ofertas";
import { NOMBRE_RUBRO, RUBROS, type Rubro } from "@/lib/validation/rubros";

/** How many published offers each trade has; an offer with two trades counts in both (D-032). */
export function contarPorRubro(
  ofertas: OfertaPublica[],
): Record<Rubro, number> {
  const cuenta = Object.fromEntries(RUBROS.map((r) => [r, 0])) as Record<
    Rubro,
    number
  >;
  for (const oferta of ofertas) {
    for (const rubro of oferta.rubros) cuenta[rubro] += 1;
  }
  return cuenta;
}

/**
 * "Buscá por rubro" on the home page (P01, D-059): every trade with how many
 * offers it has right now, the busiest first, each one opening the catalog
 * filtered by it. Trades without offers stay (quieter), so a visitor learns
 * every trade the portal covers.
 */
export function RubrosConOfertas({ ofertas }: { ofertas: OfertaPublica[] }) {
  const cuenta = contarPorRubro(ofertas);
  const orden = [...RUBROS].sort(
    (a, b) =>
      cuenta[b] - cuenta[a] ||
      NOMBRE_RUBRO[a].localeCompare(NOMBRE_RUBRO[b], "es-AR"),
  );

  return (
    <section aria-labelledby="rubros-titulo" className="flex flex-col gap-4">
      <h2 id="rubros-titulo" className="text-2xl font-semibold">
        Buscá por rubro
      </h2>
      <ul className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {orden.map((rubro) => {
          const cantidad = cuenta[rubro];
          return (
            <li key={rubro}>
              <Link
                href={`/ofertas?rubro=${rubro}`}
                className="flex min-h-14 items-center gap-3 rounded-tl-xl rounded-tr-sm rounded-br-xl rounded-bl-sm bg-card p-2.5 pr-3 ring-1 ring-foreground/5 outline-none transition-colors hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span
                  aria-hidden="true"
                  className={
                    cantidad > 0
                      ? "flex size-10 shrink-0 items-center justify-center rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-primary text-primary-foreground"
                      : "flex size-10 shrink-0 items-center justify-center rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-secondary text-primary"
                  }
                >
                  <IconoRubro rubro={rubro} className="size-5" />
                </span>
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="text-base font-medium">
                    {NOMBRE_RUBRO[rubro]}
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {cantidad === 0
                      ? "Sin ofertas por ahora"
                      : cantidad === 1
                        ? "1 oferta"
                        : `${cantidad} ofertas`}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
