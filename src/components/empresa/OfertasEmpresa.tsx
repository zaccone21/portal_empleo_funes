"use client";

import { useState } from "react";
import Link from "next/link";
import { FilterIcon, MegaphoneIcon, PlusIcon } from "lucide-react";

import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { PedirIngreso } from "@/components/estados/PedirIngreso";
import { ListaConDetalle } from "@/components/marca/ListaConDetalle";
import { ItemNoDisponible } from "@/components/ofertas/ItemNoDisponible";
import { Button, buttonVariants } from "@/components/ui/button";
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

type EstadoFiltro = "todas" | "publicada" | "pendiente" | "rechazada" | "cerrada";

const ETIQUETAS_ESTADO: Record<EstadoFiltro, string> = {
  todas: "Todas",
  publicada: "Publicadas",
  pendiente: "Pendientes",
  rechazada: "Rechazadas",
  cerrada: "Cerradas",
};

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
  const [filtroEstado, setFiltroEstado] = useState<EstadoFiltro>("todas");

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
        rol="empresa"
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

  const ofertasFiltradas = ofertas.filter((oferta) => {
    if (filtroEstado === "todas") return true;
    return oferta.estado === filtroEstado;
  });

  const eligio = seleccionadaId !== undefined;
  const enDetalle = eligio
    ? ofertas.find((oferta) => oferta.id === seleccionadaId)
    : (ofertasFiltradas[0] ?? ofertas[0]);

  return (
    <div className="flex flex-col gap-6">
      {/* Barra de filtros rápidos por estado */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-4 shadow-xs ring-1 ring-foreground/5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <FilterIcon className="size-4" /> Filtrar:
          </span>
          {(["todas", "publicada", "pendiente", "rechazada"] as const).map((estado) => {
            const cantidad = estado === "todas" ? ofertas.length : ofertas.filter((o) => o.estado === estado).length;
            const activo = filtroEstado === estado;
            return (
              <Button
                key={estado}
                variant={activo ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltroEstado(estado)}
                className="gap-1.5"
              >
                <span>{ETIQUETAS_ESTADO[estado]}</span>
                {cantidad > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                      activo ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {cantidad}
                  </span>
                )}
              </Button>
            );
          })}
        </div>

        <Link href="/empresa/ofertas/nueva" className={buttonVariants({ variant: "default", size: "sm" })}>
          <PlusIcon data-icon="inline-start" aria-hidden="true" />
          Publicar oferta
        </Link>
      </div>

      <ListaConDetalle
        eligio={eligio}
        detalleKey={enDetalle?.id ?? "no-disponible"}
        resumen={
          filtroEstado === "todas"
            ? ofertas.length === 1
              ? "Tenés 1 oferta."
              : `Tenés ${ofertas.length} ofertas.`
            : `Mostrando ${ofertasFiltradas.length} de ${ofertas.length} ofertas (${ETIQUETAS_ESTADO[filtroEstado].toLowerCase()}).`
        }
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
        {ofertasFiltradas.length === 0 ? (
          <li className="rounded-xl border border-dashed p-8 text-center text-muted-foreground bg-card/40">
            No tenés ofertas en estado &ldquo;{ETIQUETAS_ESTADO[filtroEstado].toLowerCase()}&rdquo;.
          </li>
        ) : (
          ofertasFiltradas.map((oferta) => (
            <li key={oferta.id}>
              <TarjetaOfertaEmpresa
                oferta={oferta}
                seleccionada={oferta.id === enDetalle?.id}
                soloEnEscritorio={!eligio}
              />
            </li>
          ))
        )}
      </ListaConDetalle>
    </div>
  );
}
