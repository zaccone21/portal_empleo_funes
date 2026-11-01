"use client";

<<<<<<< HEAD
import { AnimatePresence, motion } from "motion/react";

import { useState } from "react";
import Link from "next/link";
import { FilterIcon, MegaphoneIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react";
=======
import { useState } from "react";
import Link from "next/link";
import { MegaphoneIcon, PlusIcon, FilterIcon } from "lucide-react";
>>>>>>> feature/aprobar-empresas

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

<<<<<<< HEAD
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
=======
export function OfertasEmpresa({ seleccionadaId }: { seleccionadaId?: string }) {
  const { ofertas, loading, error, sinAcceso, recargar, reemplazar } = useOfertasEmpresa();
  const [filtroEstado, setFiltroEstado] = useState<EstadoFiltro>("todas");
>>>>>>> feature/aprobar-empresas

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

<<<<<<< HEAD
  const ofertasFiltradas = ofertas.filter((oferta) => {
    if (filtroEstado !== "todas" && oferta.estado !== filtroEstado) return false;
    if (busqueda) {
      const q = busqueda.trim().toLowerCase();
      const matchTitulo = oferta.titulo.toLowerCase().includes(q);
      const matchLugar = oferta.lugar.toLowerCase().includes(q);
      if (!matchTitulo && !matchLugar) return false;
    }
    return true;
=======
  // Filtrar ofertas según el estado seleccionado para dar visibilidad directa a rechazadas, pendientes, etc.
  const ofertasFiltradas = ofertas.filter((oferta) => {
    if (filtroEstado === "todas") return true;
    return oferta.estado === filtroEstado;
>>>>>>> feature/aprobar-empresas
  });

  const eligio = seleccionadaId !== undefined;
  const enDetalle = eligio
    ? ofertas.find((oferta) => oferta.id === seleccionadaId)
<<<<<<< HEAD
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

        <div className="flex items-center gap-2">
          <div className="relative min-w-[180px] sm:w-56">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="search"
              value={busqueda}
              placeholder="Buscar por puesto o lugar…"
              aria-label="Buscar en mis ofertas"
              onChange={(e) => setBusqueda(e.target.value)}
              className="h-8 w-full rounded-md border border-input bg-card pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                aria-label="Borrar búsqueda"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <XIcon className="size-3.5" />
              </button>
            )}
          </div>
          <Link href="/empresa/ofertas/nueva" className={buttonVariants({ variant: "default", size: "sm" })}>
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
=======
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
>>>>>>> feature/aprobar-empresas
        }
        detalle={
          enDetalle ? (
            <DetalleOfertaEmpresa oferta={enDetalle} elegida={eligio} onActualizada={reemplazar} />
          ) : (
            <ItemNoDisponible
<<<<<<< HEAD
              titulo="No encontramos esa oferta"
              descripcion="Elegí una de la lista."
              volverHref="/empresa/ofertas"
              volverTexto="Ver mis ofertas"
=======
              titulo="No hay ofertas en este filtro"
              descripcion="Probá seleccionando otro estado o creando una nueva."
              volverHref="/empresa/ofertas"
              volverTexto="Ver todas las ofertas"
>>>>>>> feature/aprobar-empresas
            />
          )
        }
      >
<<<<<<< HEAD
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={`${filtroEstado}-${busqueda}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex flex-col gap-3"
          >
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
          </motion.div>
        </AnimatePresence>
=======
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
>>>>>>> feature/aprobar-empresas
      </ListaConDetalle>
    </div>
  );
}