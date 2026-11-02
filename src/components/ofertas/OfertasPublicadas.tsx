"use client";

import { SearchXIcon } from "lucide-react";

import { AvisoCvFaltante } from "@/components/cv/AvisoCvFaltante";
import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { BloqueReluciente, EsqueletoTarjetaOferta } from "@/components/marca/animaciones";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useOfertasPublicadas } from "@/hooks/useOfertasPublicadas";
import { useSesion } from "@/hooks/useSesion";
import { FILTROS_VACIOS, hayFiltros, type FiltrosOfertas as Filtros } from "@/lib/catalogo";
import { cn } from "@/lib/utils";

import { FiltrosOfertas } from "./FiltrosOfertas";
import { ListaOfertas } from "./ListaOfertas";

type Props = {
  filtros?: Filtros;
  seleccionadaId?: string;
};

/**
 * The public offer catalog (P05, P06; D-025, D-029) with Computrabajo / Indeed
 * viewport lock layout on desktop:
 * - Top bar with search and compact filters pinned flush under the navbar.
 * - Workspace area with scrolling cards list on the left and immobile detail on the right.
 * - Real server-side pagination and debounced live search.
 */
export function OfertasPublicadas({ filtros = FILTROS_VACIOS, seleccionadaId }: Props) {
  const {
    ofertas,
    total,
    pagina,
    totalPaginas,
    cargandoInicial,
    actualizando,
    error,
    recargar,
    marcarPostulada,
  } = useOfertasPublicadas(filtros);
  const { usuario } = useSesion();

  if (cargandoInicial) {
    return (
      <div className="flex-1 min-h-0 mx-auto w-full max-w-[1680px] px-4 py-4 sm:px-6 lg:px-8 flex flex-col">
        <div aria-busy="true" className="grid gap-5 lg:gap-6 lg:grid-cols-[minmax(350px,420px)_minmax(0,1fr)] lg:h-full lg:min-h-0">
          <span className="sr-only" role="status">
            Cargando ofertas…
          </span>
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 5 }, (_, i) => (
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

  // Si no hay filtros activos y el portal no tiene ninguna oferta publicada en la base de datos
  if (!hayFiltros(filtros) && (!ofertas || ofertas.length === 0)) {
    return (
      <div className="flex-1 min-h-0 mx-auto w-full max-w-[1680px] px-4 py-8 sm:px-6 lg:px-8">
        <Empty className="rounded-tl-2xl rounded-br-2xl bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchXIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Por ahora no hay ofertas publicadas</EmptyTitle>
            <EmptyDescription className="text-base">
              No hay ofertas laborales activas en este momento. Te sugerimos volver a consultar pronto.
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
          "shrink-0 border-b border-border bg-card px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8 shadow-2xs",
          seleccionadaId !== undefined && "hidden lg:block"
        )}
      >
        <div className="mx-auto w-full max-w-[1680px] flex flex-col gap-2">
          {usuario?.rol === "postulante" && <AvisoCvFaltante />}
          <FiltrosOfertas
            filtros={filtros}
            ofertas={ofertas ?? []}
            className="border-0 shadow-none p-0 bg-transparent rounded-none"
          />
        </div>
      </div>
      <div
        className={cn(
          "flex-1 min-h-0 mx-auto w-full max-w-[1680px] px-4 py-4 sm:px-6 lg:px-8 flex flex-col transition-opacity duration-200",
          actualizando && "opacity-60 pointer-events-none",
        )}
      >
        <ListaOfertas
          ofertas={ofertas ?? []}
          total={total}
          pagina={pagina}
          totalPaginas={totalPaginas}
          filtros={filtros}
          seleccionadaId={seleccionadaId}
          onPostulado={marcarPostulada}
        />
      </div>
    </div>
  );
}
