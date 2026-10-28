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
 * The public offer catalog (P05, P06; D-029) with gleaming loading skeletons,
 * multi-criteria filters (Categoría, Pago, Barrio, Horario, Orden), and offer detail.
 */
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
            <EsqueletoTarjetaOferta key={i} />
          ))}
        </div>
        <BloqueReluciente className="hidden h-[30rem] rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card ring-1 ring-foreground/6 lg:block" />
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
        <FiltrosOfertas filtros={filtros} ofertas={ofertas} />
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
