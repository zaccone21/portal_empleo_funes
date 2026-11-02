"use client";

import { useState } from "react";
import Link from "next/link";
import { FilterIcon, MegaphoneIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react";

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
  const [busqueda, setBusqueda] = useState<string>("");

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
            Publicá tu primera oferta laboral para encontrar candidatos en Funes.
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
    if (filtroEstado !== "todas" && oferta.estado !== filtroEstado) return false;
    if (busqueda) {
      const q = busqueda.trim().toLowerCase();
      const matchTitulo = oferta.titulo.toLowerCase().includes(q);
      const matchLugar = oferta.lugar.toLowerCase().includes(q);
      if (!matchTitulo && !matchLugar) return false;
    }
    return true;
  });

  const eligio = seleccionadaId !== undefined;
  const enDetalle = eligio
    ? ofertas.find((oferta) => oferta.id === seleccionadaId)
    : (ofertasFiltradas[0] ?? ofertas[0]);

  return (
    <div className="flex flex-col gap-6">
      {/* Barra de filtros rápidos por estado y buscador distribuida inteligentemente */}
      <div className="flex flex-col gap-3 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-3 sm:p-4 shadow-xs ring-1 ring-foreground/5 sm:flex-row sm:items-center sm:justify-between">
        {/* Pastillas de estado con scroll horizontal limpio en mobile */}
        <div className="relative -mx-3 overflow-hidden px-3 sm:mx-0 sm:px-0">
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-card to-transparent sm:hidden" />
          <div className="flex items-center gap-1.5 overflow-x-auto pr-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:pr-0">
            <span className="mr-0.5 hidden items-center gap-1 text-xs font-medium text-muted-foreground sm:inline-flex">
              <FilterIcon className="size-3.5" /> Filtrar:
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
                  className="h-9 shrink-0 gap-1.5 px-3 text-xs sm:h-8"
                >
                  <span>{ETIQUETAS_ESTADO[estado]}</span>
                  {cantidad > 0 && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.2 text-[11px] font-semibold tabular-nums",
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
        </div>

        {/* Buscador y botón publicar (en desktop) */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="search"
              value={busqueda}
              placeholder="Buscar por puesto o lugar…"
              aria-label="Buscar en mis ofertas"
              onChange={(e) => setBusqueda(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background pl-8 pr-7 text-base text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-8 sm:text-xs"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                aria-label="Borrar búsqueda"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <XIcon className="size-3.5" />
              </button>
            )}
          </div>
          <Link href="/empresa/ofertas/nueva" className={cn(buttonVariants({ variant: "default", size: "sm" }), "hidden sm:inline-flex")}>
            <PlusIcon data-icon="inline-start" aria-hidden="true" />
            Publicar oferta
          </Link>
        </div>
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
        <div className="flex flex-col gap-3">
          {ofertasFiltradas.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground bg-card/40">
              No tenés ofertas en estado &ldquo;{ETIQUETAS_ESTADO[filtroEstado].toLowerCase()}&rdquo;.
            </div>
          ) : (
            ofertasFiltradas.map((oferta) => (
              <TarjetaOfertaEmpresa
                key={oferta.id}
                oferta={oferta}
                seleccionada={oferta.id === enDetalle?.id}
                soloEnEscritorio={!eligio}
              />
            ))
          )}
        </div>
      </ListaConDetalle>
    </div>
  );
}
