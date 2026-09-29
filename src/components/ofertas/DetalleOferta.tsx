"use client";

import { PanelDetalle } from "@/components/marca/PanelDetalle";
import { formatearDia } from "@/lib/fechas";
import type { OfertaPublica } from "@/lib/validation/ofertas";

import { AvisoPostulacion } from "./AvisoPostulacion";
import { BotonPostularme } from "./BotonPostularme";
import { DatosOferta } from "./DatosOferta";

type Props = {
  oferta: OfertaPublica;
  /** The person picked this offer; see PanelDetalle. */
  elegida: boolean;
  /** Called after applying to this offer, so the list can mark it. */
  onPostulado?: (ofertaId: string) => void;
  /** Where "Volver a las ofertas" goes on phones: the catalog with the same filters. */
  volverHref?: string;
};

/**
 * Full detail of a published offer (P06, RF1.4.2): where and when, what the
 * job is about and what it asks for, with the main action pinned at the
 * bottom. It is a panel of the same page, not a modal (D-025).
 *
 * The action depends on the offer:
 * - already applied (`yaTePostulaste`, D-028): the confirmation, with the way
 *   to "Mis postulaciones", instead of a button that would do nothing new;
 * - otherwise "Postularme" (RF1.4.3). A new BotonPostularme is mounted per
 *   offer (key), so the outcome of one offer never shows up on another.
 */
export function DetalleOferta({ oferta, elegida, onPostulado, volverHref = "/ofertas" }: Props) {
  return (
    <PanelDetalle
      elegida={elegida}
      clave={oferta.id}
      volverHref={volverHref}
      volverTexto="Volver a las ofertas"
      titulo={oferta.titulo}
      subtitulo={`Publicada el ${formatearDia(oferta.publicadaEl)}`}
      pie={
        oferta.yaTePostulaste ? (
          <AvisoPostulacion resultado={{ tipo: "postulado" }} ofertaId={oferta.id} />
        ) : (
          <BotonPostularme key={oferta.id} ofertaId={oferta.id} onPostulado={() => onPostulado?.(oferta.id)} />
        )
      }
    >
      <DatosOferta rubro={oferta.rubro} lugar={oferta.lugar} jornada={oferta.jornada} />
      <section className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">Qué vas a hacer</h3>
        <p className="text-base whitespace-pre-line">{oferta.descripcion}</p>
      </section>
      <section className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">Qué piden</h3>
        <p className="text-base whitespace-pre-line">{oferta.requisitos}</p>
      </section>
    </PanelDetalle>
  );
}
