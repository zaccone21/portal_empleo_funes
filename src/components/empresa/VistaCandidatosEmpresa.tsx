"use client";

import { useMemo, useState } from "react";
import { FilterIcon, UsersIcon } from "lucide-react";

import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { PedirIngreso } from "@/components/estados/PedirIngreso";
import { Button } from "@/components/ui/button";
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
 * Permite filtrar por estado de respuesta y buscar candidatos sin tener que recorrer oferta por oferta.
 */
export function VistaCandidatosEmpresa() {
  const { candidatos, loading, error, sinAcceso, recargar, reemplazar } = useCandidatosDerivados();
  const [filtro, setFiltro] = useState<FiltroDecision>("todos");
  const [ofertaFiltro, setOfertaFiltro] = useState<string>("todas");

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
    return candidatos.filter((c) => {
      if (filtro === "pendientes" && c.decision !== null) return false;
      if (filtro === "contratados" && c.decision !== "contratado") return false;
      if (filtro === "no_contratados" && c.decision !== "no_contratado") return false;
      if (ofertaFiltro !== "todas" && c.oferta.id !== ofertaFiltro) return false;
      return true;
    });
  }, [candidatos, filtro, ofertaFiltro]);

  const pendientesTotales = useMemo(
    () => (candidatos ?? []).filter((c) => c.decision === null).length,
    [candidatos]
  );

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
      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-4 shadow-xs ring-1 ring-foreground/5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <FilterIcon className="size-4" /> Estado:
          </span>
          <Button
            variant={filtro === "todos" ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltro("todos")}
          >
            Todos ({candidatos.length})
          </Button>
          <Button
            variant={filtro === "pendientes" ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltro("pendientes")}
            className="gap-1.5"
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
          >
            Contratados
          </Button>
          <Button
            variant={filtro === "no_contratados" ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltro("no_contratados")}
          >
            No contratados
          </Button>
        </div>

        {listaOfertas.length > 1 && (
          <select
            value={ofertaFiltro}
            aria-label="Filtrar por búsqueda"
            onChange={(e) => setOfertaFiltro(e.target.value)}
            className="h-9 rounded-md border border-input bg-card px-3 text-xs font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="todas">Todas las ofertas ({listaOfertas.length})</option>
            {listaOfertas.map((o) => (
              <option key={o.id} value={o.id}>
                {o.titulo}
              </option>
            ))}
          </select>
        )}
      </div>

      {filtrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
          No hay candidatos con los filtros seleccionados.
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
