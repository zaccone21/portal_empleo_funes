"use client";

import { useState } from "react";
import Link from "next/link";
import { MegaphoneIcon, PlusIcon, FilterIcon } from "lucide-react";

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

  // Filtrar ofertas según el estado seleccionado para dar visibilidad directa a rechazadas, pendientes, etc.
  const ofertasFiltradas = ofertas.filter((oferta) => {
    if (filtroEstado === "todas") return true;
    return oferta.estado === filtroEstado;
  });

  const eligio = seleccionadaId !== undefined;
  const enDetalle = eligio
    ? ofertas.find((oferta) => oferta.id === seleccionadaId)
    : ofertasFiltradas[0] ?? ofertas[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Barra superior de botones rápidos para filtrar por estado (soluciona el acceso a rechazadas/pendientes) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-4 rounded-xl ring-1 ring-foreground/5 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mr-1">
            <FilterIcon className="size-4" /> Filtrar:
          </span>
          <Button
            variant={filtroEstado === "todas" ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltroEstado("todas")}
          >
            Todas ({ofertas.length})
          </Button>
          <Button
            variant={filtroEstado === "publicada" ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltroEstado("publicada")}
          >
            Publicadas
          </Button>
          <Button
            variant={filtroEstado === "pendiente" ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltroEstado("pendiente")}
          >
            Pendientes
          </Button>
          <Button
            variant={filtroEstado === "rechazada" ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltroEstado("rechazada")}
          >
            Rechazadas
          </Button>
        </div>

        <Link href="/empresa/ofertas/nueva" className={buttonVariants({ variant: "default", size: "sm" })}>
          <PlusIcon data-icon="inline-start" aria-hidden="true" />
          Publicar oferta
        </Link>
      </div>

      {/* Zona de listado y detalle con separación limpia */}
      <ListaConDetalle
        eligio={eligio}
        resumen={
          filtroEstado === "todas"
            ? ofertas.length === 1
              ? "Tenés 1 oferta en total."
              : `Tenés ${ofertas.length} ofertas en total.`
            : `Mostrando ${ofertasFiltradas.length} ofertas con estado "${filtroEstado}".`
        }
        detalle={
          enDetalle ? (
            <DetalleOfertaEmpresa oferta={enDetalle} elegida={eligio} onActualizada={reemplazar} />
          ) : (
            <ItemNoDisponible
              titulo="No hay ofertas en este filtro"
              descripcion="Probá seleccionando otro estado o creando una nueva."
              volverHref="/empresa/ofertas"
              volverTexto="Ver todas las ofertas"
            />
          )
        }
      >
        {ofertasFiltradas.length === 0 ? (
          <li className="p-6 text-center text-muted-foreground">
            No tenés ofertas que coincidan con este filtro.
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