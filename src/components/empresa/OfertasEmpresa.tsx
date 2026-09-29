"use client";

import Link from "next/link";
import { MegaphoneIcon, PlusIcon } from "lucide-react";

import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { PedirIngreso } from "@/components/estados/PedirIngreso";
import { ListaConDetalle } from "@/components/marca/ListaConDetalle";
import { ItemNoDisponible } from "@/components/ofertas/ItemNoDisponible";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useOfertasEmpresa } from "@/hooks/useOfertasEmpresa";
import { cn } from "@/lib/utils";

import { DetalleOfertaEmpresa } from "./DetalleOfertaEmpresa";
import { TarjetaOfertaEmpresa } from "./TarjetaOfertaEmpresa";

/**
 * "Mis ofertas" (P12): the company's offers with their status, in a list with
 * the detail on the same page (D-025). Loads them with useOfertasEmpresa; the
 * page passes the offer selected in the URL.
 *
 * States: loading, error with "Probar de nuevo", empty (with the way to
 * publish the first offer) and the list. Asking to close an offer updates it
 * in place through `reemplazar`, without loading the list again.
 */
export function OfertasEmpresa({ seleccionadaId }: { seleccionadaId?: string }) {
  const { ofertas, loading, error, sinAcceso, recargar, reemplazar } = useOfertasEmpresa();

  if (loading) {
    return (
      <div aria-busy="true" className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <span className="sr-only" role="status">
          Cargando tus ofertas…
        </span>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-32 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card" />
          ))}
        </div>
        <Skeleton className="hidden h-[28rem] rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card lg:block" />
      </div>
    );
  }

  if (sinAcceso) {
    return (
      <PedirIngreso
        rol="company"
        titulo="Ingresá como empresa"
        descripcion="Acá vas a ver las ofertas que publicaste y cómo avanzan."
      />
    );
  }

  if (error) {
    return <ErrorAlCargar que="tus ofertas" mensaje={error} onReintentar={recargar} />;
  }

  if (!ofertas || ofertas.length === 0) {
    return (
      <Empty className="rounded-tl-2xl rounded-br-2xl bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MegaphoneIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Todavía no publicaste ofertas</EmptyTitle>
          <EmptyDescription className="text-base">
            Contá qué puesto buscás y la Oficina de Empleo la publica después de revisarla.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href="/empresa/ofertas/nueva" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
            <PlusIcon data-icon="inline-start" aria-hidden="true" />
            Publicar una oferta
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  const eligio = seleccionadaId !== undefined;
  const enDetalle = eligio ? ofertas.find((oferta) => oferta.id === seleccionadaId) : ofertas[0];

  return (
    <ListaConDetalle
      eligio={eligio}
      resumen={ofertas.length === 1 ? "Tenés 1 oferta." : `Tenés ${ofertas.length} ofertas.`}
      accion={
        <Link href="/empresa/ofertas/nueva" className={buttonVariants({ variant: "outline" })}>
          <PlusIcon data-icon="inline-start" aria-hidden="true" />
          Publicar oferta
        </Link>
      }
      detalle={
        enDetalle ? (
          <DetalleOfertaEmpresa oferta={enDetalle} elegida={eligio} onActualizada={reemplazar} />
        ) : (
          <ItemNoDisponible
            titulo="No encontramos esa oferta"
            descripcion="Elegí una de la lista."
            volverHref="/empresa/ofertas"
            volverTexto="Ver mis ofertas"
          />
        )
      }
    >
      {ofertas.map((oferta) => (
        <li key={oferta.id}>
          <TarjetaOfertaEmpresa
            oferta={oferta}
            seleccionada={oferta.id === enDetalle?.id}
            soloEnEscritorio={!eligio}
          />
        </li>
      ))}
    </ListaConDetalle>
  );
}
