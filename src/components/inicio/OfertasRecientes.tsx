"use client";

import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOfertasPublicadas } from "@/hooks/useOfertasPublicadas";
import { FILTROS_VACIOS, filtrarOfertas } from "@/lib/catalogo";

import { CarruselOfertas } from "./CarruselOfertas";
import { RubrosConOfertas } from "./RubrosConOfertas";

/** Cards in the slider: enough to browse, few enough for a cheap phone. */
const CANTIDAD = 8;
const CANTIDAD_ESQUELETO = 4;

/**
 * The newest published offers on the home page (P01, D-029), so a visitor
 * sees real jobs at once. Each card opens the offer in the catalog; "Ver todas
 * las ofertas" leads to the whole catalog. "Newest" is the only relevance the
 * portal can tell today (there is no other signal yet).
 *
 * Since 2026-10-20 (D-059) the offers are a slider of up to 8, and the same
 * list feeds "Buscá por rubro" below it, so the home page asks for the offers
 * only once.
 */
export function OfertasRecientes() {
  const { ofertas, loading, error, recargar } = useOfertasPublicadas();

  return (
    <>
    <section aria-labelledby="ofertas-recientes" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="ofertas-recientes" className="text-2xl font-semibold">
          Ofertas recientes
        </h2>
        <Link href="/ofertas" className={buttonVariants({ variant: "link", className: "px-0" })}>
          Ver todas las ofertas
          <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
        </Link>
      </div>

      {loading && (
        <div aria-busy="true" className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <span className="sr-only" role="status">
            Cargando ofertas…
          </span>
          {Array.from({ length: CANTIDAD_ESQUELETO }, (_, i) => (
            <Skeleton key={i} className="h-44 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card" />
          ))}
        </div>
      )}

      {error && <ErrorAlCargar que="las ofertas" mensaje={error} onReintentar={recargar} />}

      {ofertas && ofertas.length === 0 && (
        <p className="text-base text-muted-foreground">
          Por ahora no hay ofertas publicadas. Cuando la Oficina publique una, la vas a ver acá.
        </p>
      )}

      {ofertas && ofertas.length > 0 && (
        <CarruselOfertas ofertas={filtrarOfertas(ofertas, FILTROS_VACIOS).slice(0, CANTIDAD)} />
      )}
    </section>
    {ofertas && <RubrosConOfertas ofertas={ofertas} />}
    </>
  );
}
