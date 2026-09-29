"use client";

import Link from "next/link";
import { SearchXIcon } from "lucide-react";

import { ListaConDetalle } from "@/components/marca/ListaConDetalle";
import { buttonVariants } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
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
import { TarjetaOferta } from "./TarjetaOferta";

type Props = {
  /** Every published offer; the filters are applied here. */
  ofertas: OfertaPublica[];
  /** Search, trade and order from the URL (D-029). */
  filtros?: FiltrosOfertas;
  /** Value of ?oferta= in the URL: the offer the person picked, if any. */
  seleccionadaId?: string;
  /** Called after applying to an offer, to mark it in the list. */
  onPostulado?: (ofertaId: string) => void;
};

/**
 * The offer catalog's results with the detail on the same page (P05 + P06,
 * D-025, D-029). The selected offer and the filters live in the URL, so the
 * back button, reloading and sharing a link all work.
 *
 * Which offer the detail shows:
 * - the one in the URL, if it is still published (even if the current
 *   filters would hide it: a shared link must open what it points to);
 * - if the URL points to an offer that is no longer published, a notice;
 * - if nothing was picked, the first result (visible on desktop only; on a
 *   phone only the list shows until the person picks).
 * If the filters leave nothing, the list says so and offers to clear them.
 */
export function ListaOfertas({ ofertas, filtros = FILTROS_VACIOS, seleccionadaId, onPostulado }: Props) {
  const resultados = filtrarOfertas(ofertas, filtros);
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
          <Link href={rutaCatalogo({ ...FILTROS_VACIOS, orden: filtros.orden })} className={cn(buttonVariants({ size: "lg" }), "w-full")}>
            Ver todas las ofertas
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <ListaConDetalle
      eligio={eligio}
      resumen={describirResultados(resultados.length, filtros)}
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
    >
      {resultados.map((oferta) => (
        <li key={oferta.id}>
          <TarjetaOferta
            oferta={oferta}
            href={rutaCatalogo(filtros, oferta.id)}
            seleccionada={oferta.id === enDetalle?.id}
            soloEnEscritorio={!eligio}
          />
        </li>
      ))}
    </ListaConDetalle>
  );
}
