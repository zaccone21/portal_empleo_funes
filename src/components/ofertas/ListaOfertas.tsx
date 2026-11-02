"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, SearchXIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { ListaConDetalle } from "@/components/marca/ListaConDetalle";
import { buttonVariants } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  FILTROS_VACIOS,
  describirResultados,
  filtrarOfertas,
  rutaCatalogo,
  type FiltrosOfertas,
} from "@/lib/catalogo";
import { cn } from "@/lib/utils";
import type { OfertaPublica } from "@/lib/validation/ofertas";

import { DetalleOferta } from "./DetalleOferta";
import { ItemNoDisponible } from "./ItemNoDisponible";
import { TarjetaOfertaCatalogo } from "./TarjetaOfertaCatalogo";

type Props = {
  /** Every published offer; the filters are applied here if unpaginated. */
  ofertas: OfertaPublica[];
  /** Search, trade and order from the URL (D-029). */
  filtros?: FiltrosOfertas;
  /** Value of ?oferta= in the URL: the offer the person picked, if any. */
  seleccionadaId?: string;
  /** Called after applying to an offer, to mark it in the list. */
  onPostulado?: (ofertaId: string) => void;
  /** Total matching offers across the catalog from the backend. */
  total?: number;
  /** Current active page. */
  pagina?: number;
  /** Total available pages. */
  totalPaginas?: number;
};

/**
 * The offer catalog's results with the detail on the same page (P05 + P06,
 * D-025, D-029). The selected offer and the filters live in the URL, so the
 * back button, reloading and sharing a link all work.
 *
 * Supports server-side pagination with smooth crossfades and live search.
 */
export function ListaOfertas({
  ofertas,
  filtros = FILTROS_VACIOS,
  seleccionadaId,
  onPostulado,
  total,
  pagina = 1,
  totalPaginas = 1,
}: Props) {
  const resultados = total !== undefined ? ofertas : filtrarOfertas(ofertas, filtros);
  const totalAMostrar = total !== undefined ? total : resultados.length;
  const eligio = seleccionadaId !== undefined;
  const enDetalle = eligio ? ofertas.find((oferta) => oferta.id === seleccionadaId) : resultados[0];
  const volverHref = rutaCatalogo(filtros);

  if (resultados.length === 0 && !eligio) {
    return (
      <Empty className="rounded-tl-2xl rounded-br-2xl bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>No encontramos ofertas con esa búsqueda</EmptyTitle>
          <EmptyDescription className="text-base">
            Probá con otra palabra o mirá todas las ofertas publicadas.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link
            href={rutaCatalogo({ ...FILTROS_VACIOS, orden: filtros.orden })}
            className={cn(buttonVariants({ size: "lg" }), "w-full")}
          >
            Ver todas las ofertas
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <ListaConDetalle
      eligio={eligio}
      detalleKey={enDetalle?.id ?? "no-disponible"}
      resumen={describirResultados(totalAMostrar, filtros)}
      detalle={
        enDetalle ? (
          <DetalleOferta oferta={enDetalle} elegida={eligio} onPostulado={onPostulado} volverHref={volverHref} />
        ) : (
          <ItemNoDisponible
            titulo="Esta oferta ya no está publicada"
            descripcion="Puede que se haya cubierto el puesto. Mirá las otras ofertas."
            volverHref={volverHref}
            volverTexto="Ver las ofertas"
          />
        )
      }
      pieLista={
        totalPaginas > 1 ? (
          <PaginacionOfertas
            paginaActual={pagina}
            totalPaginas={totalPaginas}
            filtros={filtros}
          />
        ) : undefined
      }
    >
      <AnimatePresence initial={false}>
        {resultados.map((oferta) => (
          <motion.li
            key={oferta.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <TarjetaOfertaCatalogo
              oferta={oferta}
              href={rutaCatalogo(filtros, oferta.id)}
              seleccionada={oferta.id === enDetalle?.id}
              soloEnEscritorio={!eligio}
            />
          </motion.li>
        ))}
      </AnimatePresence>
    </ListaConDetalle>
  );
}

function PaginacionOfertas({
  paginaActual,
  totalPaginas,
  filtros,
}: {
  paginaActual: number;
  totalPaginas: number;
  filtros: FiltrosOfertas;
}) {
  const paginas = useMemo(() => {
    if (totalPaginas <= 7) {
      return Array.from({ length: totalPaginas }, (_, i) => i + 1);
    }
    if (paginaActual <= 4) {
      return [1, 2, 3, 4, 5, "ellipsis-final", totalPaginas] as const;
    }
    if (paginaActual >= totalPaginas - 3) {
      return [
        1,
        "ellipsis-inicial",
        totalPaginas - 4,
        totalPaginas - 3,
        totalPaginas - 2,
        totalPaginas - 1,
        totalPaginas,
      ] as const;
    }
    return [
      1,
      "ellipsis-inicial",
      paginaActual - 1,
      paginaActual,
      paginaActual + 1,
      "ellipsis-final",
      totalPaginas,
    ] as const;
  }, [paginaActual, totalPaginas]);

  return (
    <Pagination className="py-1">
      <PaginationContent className="gap-1 flex-wrap justify-center">
        {paginaActual > 1 && (
          <PaginationItem>
            <Link
              href={rutaCatalogo(filtros, undefined, paginaActual - 1)}
              scroll={false}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 px-2 text-xs font-sans gap-1 text-muted-foreground hover:text-foreground",
              )}
            >
              <ChevronLeftIcon className="size-3.5" />
              <span className="hidden sm:inline">Anterior</span>
            </Link>
          </PaginationItem>
        )}

        {paginas.map((p, idx) => {
          if (typeof p === "string") {
            return (
              <PaginationItem key={`${p}-${idx}`}>
                <PaginationEllipsis className="size-8" />
              </PaginationItem>
            );
          }

          const esActiva = p === paginaActual;
          return (
            <PaginationItem key={p}>
              <Link
                href={rutaCatalogo(filtros, undefined, p)}
                scroll={false}
                aria-current={esActiva ? "page" : undefined}
                className={cn(
                  buttonVariants({
                    variant: esActiva ? "outline" : "ghost",
                    size: "sm",
                  }),
                  "size-8 p-0 text-xs font-sans font-medium rounded-md",
                  esActiva &&
                    "border-primary/50 bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary",
                )}
              >
                {p}
              </Link>
            </PaginationItem>
          );
        })}

        {paginaActual < totalPaginas && (
          <PaginationItem>
            <Link
              href={rutaCatalogo(filtros, undefined, paginaActual + 1)}
              scroll={false}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 px-2 text-xs font-sans gap-1 text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRightIcon className="size-3.5" />
            </Link>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
