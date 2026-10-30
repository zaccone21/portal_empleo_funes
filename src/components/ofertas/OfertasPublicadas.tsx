"use client";

import { SearchXIcon } from "lucide-react";

import { AvisoCvFaltante } from "@/components/cv/AvisoCvFaltante";
import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { BloqueReluciente, EsqueletoTarjetaOferta } from "@/components/marca/animaciones";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useOfertasPublicadas } from "@/hooks/useOfertasPublicadas";
import { useSesion } from "@/hooks/useSesion";
import { FILTROS_VACIOS, type FiltrosOfertas as Filtros } from "@/lib/catalogo";
import { cn } from "@/lib/utils";

import { FiltrosOfertas } from "./FiltrosOfertas";
import { ListaOfertas } from "./ListaOfertas";

type Props = {
  filtros?: Filtros;
  seleccionadaId?: string;
};

/**
 * The public offer catalog (P05, P06; D-025, D-029) with Computrabajo-style
 * viewport lock layout on desktop:
 * - Top bar with search and compact filters pinned flush under the navbar.
 * - Workspace area with scrolling cards list on the left and immobile detail on the right.
 */
export function OfertasPublicadas({ filtros = FILTROS_VACIOS, seleccionadaId }: Props) {
  const { ofertas, loading, error, recargar, marcarPostulada } = useOfertasPublicadas();
  const { usuario } = useSesion();

  if (loading) {
    return (
      <div className="flex-1 min-h-0 mx-auto w-full max-w-[1680px] px-4 py-4 sm:px-6 lg:px-8 flex flex-col">
        <div aria-busy="true" className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:h-full lg:min-h-0">
          <span className="sr-only" role="status">
            Cargando ofertas…
          </span>
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }, (_, i) => (
              <EsqueletoTarjetaOferta key={i} />
            ))}
          </div>
          <BloqueReluciente className="hidden h-[30rem] rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card ring-1 ring-foreground/6 lg:block" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 min-h-0 mx-auto w-full max-w-[1680px] px-4 py-8 sm:px-6 lg:px-8">
        <ErrorAlCargar que="las ofertas" mensaje={error} onReintentar={recargar} />
      </div>
    );
  }

  if (!ofertas || ofertas.length === 0) {
    return (
      <div className="flex-1 min-h-0 mx-auto w-full max-w-[1680px] px-4 py-8 sm:px-6 lg:px-8">
        <Empty className="rounded-tl-2xl rounded-br-2xl bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchXIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Por ahora no hay ofertas publicadas</EmptyTitle>
            <EmptyDescription className="text-base">
              Cuando la Oficina de Empleo publique una oferta nueva, la vas a ver acá.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div
        className={cn(
          "shrink-0 border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8 shadow-2xs",
          seleccionadaId !== undefined && "hidden lg:block"
        )}
      >
        <div className="mx-auto w-full max-w-[1680px] flex flex-col gap-3">
          {usuario?.rol === "postulante" && <AvisoCvFaltante />}
          <FiltrosOfertas
            filtros={filtros}
            ofertas={ofertas}
            className="border-0 shadow-none p-0 bg-transparent rounded-none"
          />
        </div>
      </div>
      <div className="flex-1 min-h-0 mx-auto w-full max-w-[1680px] px-4 py-4 sm:px-6 lg:px-8 flex flex-col">
        <ListaOfertas
          ofertas={ofertas}
          filtros={filtros}
          seleccionadaId={seleccionadaId}
          onPostulado={marcarPostulada}
        />
      </div>
    </div>
  );
}
