import { CircleCheckIcon, MapPinIcon } from "lucide-react";

import { TarjetaSeleccionable } from "@/components/marca/TarjetaSeleccionable";
import { Badge } from "@/components/ui/badge";
import { esFechaReciente, formatearTiempoRelativo } from "@/lib/fechas";
import {
  NOMBRE_MODALIDAD,
  NOMBRE_TIPO_JORNADA,
} from "@/lib/validation/estandarizacion";
import type { OfertaPublica } from "@/lib/validation/ofertas";
import { NOMBRE_RUBRO } from "@/lib/validation/rubros";

type Props = {
  oferta: OfertaPublica;
  /** Where the card goes: the catalog with this offer selected and the current filters kept. */
  href: string;
  /** This offer's detail is the one on screen. */
  seleccionada: boolean;
  /** Highlight only on desktop (nothing was picked yet); see TarjetaSeleccionable. */
  soloEnEscritorio: boolean;
};

/**
 * Compact offer card for the catalog (/ofertas), inspired by Computrabajo and Indeed:
 * title, location/modality, trade and schedule in clean secondary text,
 * relative timestamp, and "Te postulaste" status when applied (D-028).
 */
export function TarjetaOfertaCatalogo({ oferta, href, seleccionada, soloEnEscritorio }: Props) {
  const reciente = esFechaReciente(oferta.publicadaEl, 3);
  const relativo = formatearTiempoRelativo(oferta.publicadaEl);

  return (
    <TarjetaSeleccionable
      href={href}
      seleccionada={seleccionada}
      soloEnEscritorio={soloEnEscritorio}
      className="h-auto min-h-0 p-3.5 sm:p-4 gap-2.5"
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          {oferta.yaTePostulaste ? (
            <Badge
              variant="outline"
              className="border-primary/40 bg-primary/10 text-primary text-[11px] font-semibold gap-1 py-0 px-2 h-5"
            >
              <CircleCheckIcon aria-hidden="true" className="size-3 shrink-0" />
              Te postulaste
            </Badge>
          ) : reciente ? (
            <Badge
              variant="secondary"
              className="text-[11px] font-semibold py-0 px-2 h-5 text-secondary-foreground"
            >
              Nueva
            </Badge>
          ) : null}
          <span className="text-xs text-muted-foreground ml-auto shrink-0">{relativo}</span>
        </div>

        <h2 className="line-clamp-2 font-heading text-base font-semibold leading-snug text-foreground sm:text-[17px]">
          {oferta.titulo}
        </h2>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
          <MapPinIcon aria-hidden="true" className="size-3.5 shrink-0 text-primary" />
          <span className="truncate">
            {oferta.modalidad ? `${NOMBRE_MODALIDAD[oferta.modalidad]} · ${oferta.lugar}` : oferta.lugar}
          </span>
        </p>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground pt-0.5">
          {oferta.rubros && oferta.rubros.length > 0 && (
            <span className="truncate max-w-[12rem]">
              {oferta.rubros.map((r) => NOMBRE_RUBRO[r]).join(" · ")}
            </span>
          )}
          <span>•</span>
          <span className="truncate">
            {oferta.tipoJornada ? NOMBRE_TIPO_JORNADA[oferta.tipoJornada] : oferta.jornada}
          </span>
          {oferta.sueldo && (
            <>
              <span>•</span>
              <span className="font-medium text-foreground truncate">{oferta.sueldo}</span>
            </>
          )}
        </div>
      </div>
    </TarjetaSeleccionable>
  );
}
