"use client";

import { SearchXIcon } from "lucide-react";

import { AvisoCvFaltante } from "@/components/cv/AvisoCvFaltante";
import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useOfertasPublicadas } from "@/hooks/useOfertasPublicadas";
import { useSesion } from "@/hooks/useSesion";
import { FILTROS_VACIOS, type FiltrosOfertas as Filtros } from "@/lib/catalogo";
import { cn } from "@/lib/utils";

import { FiltrosOfertas } from "./FiltrosOfertas";
import { ListaOfertas } from "./ListaOfertas";

/**
 * The public offer catalog (P05, P06; D-029) with its four states: loading,
 * error, empty and the results with their detail. Loads the offers with
 * useOfertasPublicadas; the page passes the filters and the offer selected in
 * the URL. The search, trade chips and order sit above the results; on a
 * phone they hide while an offer is open, so the detail gets the screen.
 *
 * The hook lives here, above ListaOfertas, so choosing another offer (which
 * only changes ?oferta=) re-renders the list without loading it again, and
 * applying marks the offer in place (marcarPostulada).
 *
 * For a logged-in applicant it also shows, above the list, the reminder to
 * upload the CV when it is missing (AvisoCvFaltante).
 */
type Props = {
  filtros?: Filtros;
  seleccionadaId?: string;
};

export function OfertasPublicadas({ filtros = FILTROS_VACIOS, seleccionadaId }: Props) {
  const { ofertas, loading, error, recargar, marcarPostulada } = useOfertasPublicadas();
  const { usuario } = useSesion();

  if (loading) {
    return (
      <div aria-busy="true" className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <span className="sr-only" role="status">
          Cargando ofertas…
        </span>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-36 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card" />
          ))}
        </div>
        <Skeleton className="hidden h-[28rem] rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card lg:block" />
      </div>
    );
  }

  if (error) {
    return <ErrorAlCargar que="las ofertas" mensaje={error} onReintentar={recargar} />;
  }

  if (!ofertas || ofertas.length === 0) {
    return (
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
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className={cn("flex flex-col gap-5", seleccionadaId !== undefined && "hidden lg:flex")}>
        {usuario?.rol === "postulante" && <AvisoCvFaltante />}
        <FiltrosOfertas filtros={filtros} />
      </div>
      <ListaOfertas
        ofertas={ofertas}
        filtros={filtros}
        seleccionadaId={seleccionadaId}
        onPostulado={marcarPostulada}
      />
    </div>
  );
}
