import { CircleXIcon, InfoIcon } from "lucide-react";

import { PanelDetalle } from "@/components/marca/PanelDetalle";
import { DatosOferta } from "@/components/ofertas/DatosOferta";
import { EstadoOferta } from "@/components/ofertas/EstadoOferta";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatearDia } from "@/lib/fechas";
import type { EstadoOferta as Estado, OfertaEmpresa } from "@/lib/validation/ofertas";

import { BotonSolicitarCierre } from "./BotonSolicitarCierre";

/** What each status means for the company, in its words. */
const EXPLICACION: Record<Estado, string> = {
  pendiente: "La Oficina de Empleo la está revisando. Cuando la publique, la van a ver quienes buscan trabajo.",
  publicada: "Está publicada: la ven quienes buscan trabajo en el portal.",
  rechazada: "La Oficina de Empleo no la publicó.",
  cerrada: "Está cerrada: ya no se muestra ni recibe postulaciones.",
};

type Props = {
  oferta: OfertaEmpresa;
  /** The company picked this offer; see PanelDetalle. */
  elegida: boolean;
  /** Receives the offer after asking to close it, to update the list. */
  onActualizada: (oferta: OfertaEmpresa) => void;
};

/**
 * Detail of one of the company's offers (P12), on the same page as the list.
 *
 * What it shows, in order:
 * 1. The status with what it means (RF1.3.4).
 * 2. If rejected, the Office's reason (RF1.3.5). Only the owning company gets
 *    this field from the server.
 * 3. If the company asked to close it, that the offer stays published until
 *    the Office closes it (RF1.3.6).
 * 4. The offer as it was sent.
 * The only action is "Pedir el cierre", on published offers without a
 * previous request. Editing a rejected offer or cancelling a close request is
 * not offered while Q-002 and Q-003 are open.
 */
export function DetalleOfertaEmpresa({ oferta, elegida, onActualizada }: Props) {
  const puedePedirCierre = oferta.estado === "publicada" && !oferta.cierreSolicitado;

  return (
    <PanelDetalle
      elegida={elegida}
      clave={oferta.id}
      volverHref="/empresa/ofertas"
      volverTexto="Volver a mis ofertas"
      titulo={oferta.titulo}
      subtitulo={`Enviada el ${formatearDia(oferta.creadaEl)}`}
      pie={puedePedirCierre ? <BotonSolicitarCierre ofertaId={oferta.id} onSolicitado={onActualizada} /> : undefined}
    >
      <section className="flex flex-col items-start gap-2">
        <h3 className="sr-only">Estado</h3>
        <EstadoOferta estado={oferta.estado} />
        <p className="text-base">{EXPLICACION[oferta.estado]}</p>
      </section>
      {oferta.estado === "rechazada" && oferta.motivoRechazo && (
        <Alert variant="destructive">
          <CircleXIcon aria-hidden="true" />
          <AlertTitle className="text-base">Motivo del rechazo</AlertTitle>
          <AlertDescription className="text-base">{oferta.motivoRechazo}</AlertDescription>
        </Alert>
      )}
      {oferta.cierreSolicitado && oferta.estado === "publicada" && (
        <Alert>
          <InfoIcon aria-hidden="true" />
          <AlertTitle className="text-base">Pediste el cierre</AlertTitle>
          <AlertDescription className="text-base">
            La Oficina de Empleo la va a cerrar. Mientras tanto sigue publicada.
          </AlertDescription>
        </Alert>
      )}
      <DatosOferta rubros={oferta.rubros} lugar={oferta.lugar} jornada={oferta.jornada} sueldo={oferta.sueldo} />
      <section className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">Descripción del puesto</h3>
        <p className="text-base whitespace-pre-line">{oferta.descripcion}</p>
      </section>
      <section className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">Requisitos</h3>
        <p className="text-base whitespace-pre-line">{oferta.requisitos}</p>
      </section>
    </PanelDetalle>
  );
}
