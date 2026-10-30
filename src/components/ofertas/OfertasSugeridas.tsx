"use client";

import Link from "next/link";
import { ArrowRightIcon, SparklesIcon, WrenchIcon } from "lucide-react";

import { CarruselOfertas } from "@/components/inicio/CarruselOfertas";
import { BloqueReluciente, EsqueletoTarjetaOferta } from "@/components/marca/animaciones";
import { IconoRubro } from "@/components/ofertas/IconoRubro";
import { buttonVariants } from "@/components/ui/button";
import { useOfertasPublicadas } from "@/hooks/useOfertasPublicadas";
import { usePerfilPostulante } from "@/hooks/usePerfilPostulante";
import { cn } from "@/lib/utils";
import { NOMBRE_RUBRO, type Rubro } from "@/lib/validation/rubros";

const MAX_SUGERENCIAS = 8;

type Props = {
  /** Custom section title; defaults to "Sugeridas para tu perfil". */
  titulo?: string;
};

/**
 * Personalized job offer recommendations matching the logged-in applicant's
 * selected trades (`perfil.rubros`), shown on the Home page (`/`) and on
 * "Mis postulaciones" (`/postulante/postulaciones`).
 */
export function OfertasSugeridas({ titulo = "Sugeridas para tu perfil" }: Props) {
  const {
    perfil,
    loading: cargandoPerfil,
    sinAcceso,
    error: errorPerfil,
  } = usePerfilPostulante();
  const { ofertas, loading: cargandoOfertas } = useOfertasPublicadas();

  if (sinAcceso || errorPerfil) return null;

  if (cargandoPerfil || cargandoOfertas) {
    return (
      <section aria-busy="true" className="flex flex-col gap-4">
        <BloqueReluciente className="h-8 w-64 rounded-lg bg-card" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <EsqueletoTarjetaOferta key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (!perfil) return null;

  const rubrosElegidos: Rubro[] = perfil.rubros.map(
    (r: { slug: Rubro }) => r.slug,
  );

  if (rubrosElegidos.length === 0) {
    return (
      <section
        aria-labelledby="sugerencias-vacias-titulo"
        className="flex flex-col justify-between gap-4 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 ring-1 ring-foreground/5 sm:flex-row sm:items-center sm:p-6"
      >
        <div className="flex items-start gap-3.5">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"
          >
            <WrenchIcon className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <h2 id="sugerencias-vacias-titulo" className="font-heading text-lg font-semibold">
              Elegí tus rubros para recibir ofertas recomendadas
            </h2>
            <p className="text-sm text-muted-foreground">
              Cuando marques tus oficios en tu perfil, acá vas a ver las búsquedas que coincidan con lo que sabés hacer.
            </p>
          </div>
        </div>
        <Link
          href="/postulante/perfil"
          className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}
        >
          Elegir mis rubros
          <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
        </Link>
      </section>
    );
  }

  const conjuntoRubros = new Set<Rubro>(rubrosElegidos);
  const ofertasCoincidentes = (ofertas ?? [])
    .filter((oferta) => oferta.rubros.some((rubro) => conjuntoRubros.has(rubro)))
    .sort((a, b) => {
      if (a.yaTePostulaste !== b.yaTePostulaste) {
        return a.yaTePostulaste ? 1 : -1;
      }
      return b.publicadaEl.localeCompare(a.publicadaEl);
    })
    .slice(0, MAX_SUGERENCIAS);

  return (
    <section aria-labelledby="ofertas-sugeridas-titulo" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <SparklesIcon aria-hidden="true" className="size-5 text-primary" />
            <h2 id="ofertas-sugeridas-titulo" className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              {titulo}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Según los rubros que elegiste en tu perfil laboral.
          </p>
        </div>

        <Link
          href={`/ofertas?rubro=${encodeURIComponent(rubrosElegidos[0])}`}
          className={buttonVariants({ variant: "link", className: "px-0 font-semibold" })}
        >
          Filtrar catálogo por mis rubros
          <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {rubrosElegidos.map((rubro) => (
          <Link
            key={rubro}
            href={`/ofertas?rubro=${encodeURIComponent(rubro)}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <IconoRubro rubro={rubro} className="size-3.5" />
            {NOMBRE_RUBRO[rubro]}
          </Link>
        ))}
      </div>

      {ofertasCoincidentes.length > 0 ? (
        <CarruselOfertas ofertas={ofertasCoincidentes} autoPlay />
      ) : (
        <div className="rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-5 text-sm text-muted-foreground ring-1 ring-foreground/5">
          Por el momento no hay ofertas activas en tus rubros elegidos.{" "}
          <Link href="/ofertas" className="font-semibold text-primary hover:underline">
            Explorá todas las ofertas publicadas
          </Link>
          .
        </div>
      )}
    </section>
  );
}
