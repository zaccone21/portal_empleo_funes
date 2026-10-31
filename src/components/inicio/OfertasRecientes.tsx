"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { EsqueletoTarjetaOferta } from "@/components/marca/animaciones";
import { buttonVariants } from "@/components/ui/button";
import { useOfertasPublicadas } from "@/hooks/useOfertasPublicadas";
import { usePerfilPostulante } from "@/hooks/usePerfilPostulante";
import { FILTROS_VACIOS, filtrarOfertas } from "@/lib/catalogo";
import type { Rubro } from "@/lib/validation/rubros";

import { CarruselOfertas } from "./CarruselOfertas";

/** Maximum 9 cards in the recent offers carousel, never repeating suggested ones. */
const CANTIDAD_MAXIMA = 9;
const MAX_SUGERENCIAS_PERFIL = 8;
const CANTIDAD_ESQUELETO = 4;

/**
 * The newest published offers on the home page (P01, D-029).
 * - Displays an automatic + manual carousel of up to 9 cards (`CANTIDAD_MAXIMA = 9`).
 * - When the visitor is a logged-in applicant who already sees `OfertasSugeridas`,
 *   excludes the offer IDs shown in `OfertasSugeridas` so cards are never duplicated.
 */
export function OfertasRecientes() {
  const { ofertas, loading, error, recargar } = useOfertasPublicadas();
  const { perfil } = usePerfilPostulante();

  const ofertasParaMostrar = useMemo(() => {
    if (!ofertas) return [];
    const ordenadas = filtrarOfertas(ofertas, FILTROS_VACIOS);

    const rubrosElegidos: Rubro[] = perfil
      ? perfil.rubros.map((r: { slug: Rubro }) => r.slug)
      : [];

    if (rubrosElegidos.length === 0) {
      return ordenadas.slice(0, CANTIDAD_MAXIMA);
    }

    const conjuntoRubros = new Set<Rubro>(rubrosElegidos);
    const idsSugeridas = new Set(
      ofertas
        .filter((oferta) => oferta.rubros.some((r) => conjuntoRubros.has(r)))
        .sort((a, b) => {
          if (a.yaTePostulaste !== b.yaTePostulaste) {
            return a.yaTePostulaste ? 1 : -1;
          }
          return b.publicadaEl.localeCompare(a.publicadaEl);
        })
        .slice(0, MAX_SUGERENCIAS_PERFIL)
        .map((o) => o.id),
    );

    return ordenadas.filter((o) => !idsSugeridas.has(o.id)).slice(0, CANTIDAD_MAXIMA);
  }, [ofertas, perfil]);

  return (
    <section aria-labelledby="ofertas-recientes" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="ofertas-recientes" className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Ofertas más recientes
          </h2>
          <p className="text-sm text-muted-foreground">
            Las últimas búsquedas laborales publicadas por la Oficina de Empleo en Funes.
          </p>
        </div>
        <Link href="/ofertas" className={buttonVariants({ variant: "link", className: "px-0 font-semibold" })}>
          Ver todas las ofertas
          <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
        </Link>
      </div>

      {loading && (
        <div aria-busy="true" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <span className="sr-only" role="status">
            Cargando ofertas…
          </span>
          {Array.from({ length: CANTIDAD_ESQUELETO }, (_, i) => (
            <EsqueletoTarjetaOferta key={i} />
          ))}
        </div>
      )}

      {error && <ErrorAlCargar que="las ofertas" mensaje={error} onReintentar={recargar} />}

      {ofertas && ofertas.length === 0 && (
        <p className="text-base text-muted-foreground">
          Por ahora no hay ofertas publicadas. Cuando la Oficina publique una, la vas a ver acá.
        </p>
      )}

      {ofertas && ofertas.length > 0 && ofertasParaMostrar.length === 0 && (
        <div className="rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 text-sm text-muted-foreground ring-1 ring-foreground/5">
          Todas las ofertas activas del momento coinciden con tus rubros y ya las tenés arriba en{" "}
          <strong className="text-foreground">Sugeridas para tu perfil</strong>.{" "}
          <Link href="/ofertas" className="font-semibold text-primary hover:underline">
            Ir al catálogo completo
          </Link>
          .
        </div>
      )}

      {ofertasParaMostrar.length > 0 && (
        <CarruselOfertas ofertas={ofertasParaMostrar} autoPlay />
      )}
    </section>
  );
}
