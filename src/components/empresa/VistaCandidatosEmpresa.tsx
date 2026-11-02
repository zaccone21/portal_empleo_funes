"use client";

import { useMemo, useState } from "react";
import { FilterIcon, SearchIcon, UsersIcon, XIcon } from "lucide-react";

import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { PedirIngreso } from "@/components/estados/PedirIngreso";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useCandidatosDerivados } from "@/hooks/useCandidatosDerivados";

import { TarjetaCandidato } from "./TarjetaCandidato";

type FiltroDecision = "todos" | "pendientes" | "contratados" | "no_contratados";

/**
 * Vista centralizada de candidatos derivados para la empresa (`/empresa/candidatos`).
 * Permite filtrar por estado de respuesta, por búsqueda/oferta y buscar candidatos por nombre o puesto.
 */
export function VistaCandidatosEmpresa() {
  const { candidatos, loading, error, sinAcceso, recargar, reemplazar } = useCandidatosDerivados();
  const [filtro, setFiltro] = useState<FiltroDecision>("todos");
  const [ofertaFiltro, setOfertaFiltro] = useState<string>("todas");
  const [busqueda, setBusqueda] = useState<string>("");

  const listaOfertas = useMemo(() => {
    if (!candidatos) return [];
    const ofertasMap = new Map<string, string>();
    for (const c of candidatos) {
      if (!ofertasMap.has(c.oferta.id)) {
        ofertasMap.set(c.oferta.id, c.oferta.titulo);
      }
    }
    return Array.from(ofertasMap.entries()).map(([id, titulo]) => ({ id, titulo }));
  }, [candidatos]);

  const filtrados = useMemo(() => {
    if (!candidatos) return [];
    const query = busqueda.trim().toLowerCase();

    return candidatos.filter((c) => {
      if (filtro === "pendientes" && c.decision !== null) return false;
      if (filtro === "contratados" && c.decision !== "contratado") return false;
      if (filtro === "no_contratados" && c.decision !== "no_contratado") return false;
      if (ofertaFiltro !== "todas" && c.oferta.id !== ofertaFiltro) return false;

      if (query) {
        const nombreCompleto = `${c.nombre ?? ""} ${c.apellido ?? ""}`.toLowerCase();
        const puesto = (c.oferta?.titulo ?? "").toLowerCase();
        if (!nombreCompleto.includes(query) && !puesto.includes(query)) return false;
      }

      return true;
    });
  }, [candidatos, filtro, ofertaFiltro, busqueda]);

  const pendientesTotales = useMemo(
    () => (candidatos ?? []).filter((c) => c.decision === null).length,
    [candidatos]
  );

  const hayFiltrosActivos = filtro !== "todos" || ofertaFiltro !== "todas" || busqueda !== "";

  const limpiarFiltros = () => {
    setFiltro("todos");
    setOfertaFiltro("todas");
    setBusqueda("");
  };

  if (loading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-4">
        <span className="sr-only" role="status">
          Cargando candidatos…
        </span>
        <Skeleton className="h-12 w-64 rounded-lg bg-card" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-56 rounded-tl-2xl rounded-br-2xl bg-card" />
          ))}
        </div>
      </div>
    );
  }

  if (sinAcceso) {
    return (
      <PedirIngreso
        rol="empresa"
        titulo="Ingresá como empresa"
        descripcion="Para ver y responder por los candidatos propuestos."
      />
    );
  }

  if (error) {
    return <ErrorAlCargar que="los candidatos" mensaje={error} onReintentar={recargar} />;
  }

  if (!candidatos || candidatos.length === 0) {
    return (
      <Empty className="rounded-tl-2xl rounded-br-2xl bg-card p-8">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UsersIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Todavía no hay candidatos propuestos</EmptyTitle>
          <EmptyDescription className="text-base max-w-md">
            Cuando la Oficina de Empleo encuentre personas que coincidan con tus ofertas publicadas,
            las vas a ver acá con su contacto directo y su CV.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col gap-3 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-3 sm:p-4 shadow-xs ring-1 ring-foreground/5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="mr-1 hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <FilterIcon className="size-3.5" /> Estado:
            </span>
            <Button
              variant={filtro === "todos" ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltro("todos")}
              className="h-8 text-xs font-medium"
            >
              Todos ({candidatos.length})
            </Button>
            <Button
              variant={filtro === "pendientes" ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltro("pendientes")}
              className="h-8 gap-1.5 text-xs font-medium"
            >
              <span>Pendientes</span>
              {pendientesTotales > 0 && (
                <span className="rounded-full bg-attention/20 px-1.5 py-0.2 text-xs font-semibold text-attention-foreground">
                  {pendientesTotales}
                </span>
              )}
            </Button>
            <Button
              variant={filtro === "contratados" ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltro("contratados")}
              className="h-8 text-xs font-medium"
            >
              Contratados
            </Button>
            <Button
              variant={filtro === "no_contratados" ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltro("no_contratados")}
              className="h-8 text-xs font-medium"
            >
              No contratados
            </Button>

            {listaOfertas.length > 1 && (
              <Select
                value={ofertaFiltro}
                onValueChange={(val) => setOfertaFiltro(val ?? "todas")}
              >
                <SelectTrigger
                  aria-label="Filtrar por búsqueda"
                  className="h-8 w-auto min-w-[190px] max-w-xs sm:max-w-md bg-card text-xs font-medium border-border/80 gap-1.5 px-2.5"
                >
                  <span className="text-muted-foreground font-normal shrink-0">Búsqueda:</span>
                  <span
                    className="font-semibold text-foreground truncate"
                    title={
                      ofertaFiltro === "todas"
                        ? `Todas las ofertas (${listaOfertas.length})`
                        : listaOfertas.find((o) => o.id === ofertaFiltro)?.titulo ?? ""
                    }
                  >
                    {ofertaFiltro === "todas"
                      ? `Todas (${listaOfertas.length})`
                      : listaOfertas.find((o) => o.id === ofertaFiltro)?.titulo ?? "Oferta"}
                  </span>
                </SelectTrigger>
                <SelectContent align="start" className="min-w-64 max-w-xl">
                  <SelectItem value="todas">Todas las ofertas ({listaOfertas.length})</SelectItem>
                  {listaOfertas.map((o) => (
                    <SelectItem key={o.id} value={o.id} className="whitespace-normal py-2 text-xs leading-snug">
                      {o.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Buscador de candidatos */}
          <div className="relative flex-1 sm:max-w-xs min-w-[200px]">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="search"
              value={busqueda}
              placeholder="Buscar candidato o puesto…"
              aria-label="Buscar candidatos por nombre o puesto"
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
        </div>

        {/* Resumen de filtros */}
        {hayFiltrosActivos && (
          <div className="flex items-center justify-between border-t border-border/50 pt-2 text-xs text-muted-foreground">
            <span>
              Mostrando {filtrados.length} de {candidatos.length} candidatos
            </span>
            <button
              type="button"
              onClick={limpiarFiltros}
              className="font-medium text-primary hover:underline cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </div>

      {filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-base font-semibold text-foreground">No hay candidatos con los filtros seleccionados</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Probá quitando palabras clave o seleccionando otra búsqueda u opción de estado.
          </p>
          <Button variant="outline" size="sm" onClick={limpiarFiltros} className="mt-2">
            Ver todos los candidatos
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {filtrados.map((candidato) => (
            <li key={candidato.postulacionId}>
              <TarjetaCandidato candidato={candidato} onDecidido={reemplazar} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
