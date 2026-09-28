"use client";

import { SearchXIcon } from "lucide-react";

import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useOfertasPublicadas } from "@/hooks/useOfertasPublicadas";

import { ListaOfertas } from "./ListaOfertas";

/**
 * The public offer list (P05, P06) with its four states: loading, error,
 * empty and the list with its detail. Loads the offers with
 * useOfertasPublicadas; the page passes the offer selected in the URL.
 *
 * The hook lives here, above ListaOfertas, so choosing another offer (which
 * only changes ?oferta=) re-renders the list without loading it again.
 */
export function OfertasPublicadas({ seleccionadaId }: { seleccionadaId?: string }) {
  const { ofertas, loading, error, recargar } = useOfertasPublicadas();

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

  return <ListaOfertas ofertas={ofertas} seleccionadaId={seleccionadaId} />;
}
