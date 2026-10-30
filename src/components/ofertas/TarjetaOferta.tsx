import { CalendarIcon, CircleCheckIcon } from "lucide-react";

import { TarjetaSeleccionable } from "@/components/marca/TarjetaSeleccionable";
import { Badge } from "@/components/ui/badge";
import { esFechaReciente, formatearDia, formatearTiempoRelativo } from "@/lib/fechas";
import type { OfertaPublica } from "@/lib/validation/ofertas";

import { DatosOferta } from "./DatosOferta";

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
 * One offer in the catalog (P05, RF1.4.1): title, trade, where, when and the
 * publication date (highlighted when recent), plus "Te postulaste" when the
 * logged-in applicant already applied (D-028).
 */
export function TarjetaOferta({ oferta, href, seleccionada, soloEnEscritorio }: Props) {
  const reciente = esFechaReciente(oferta.publicadaEl, 3);
  const relativo = formatearTiempoRelativo(oferta.publicadaEl);

  return (
    <TarjetaSeleccionable href={href} seleccionada={seleccionada} soloEnEscritorio={soloEnEscritorio}>
      <div className="flex items-start justify-between gap-2">
        <h2 className="line-clamp-2 min-h-[2lh] font-heading text-lg leading-snug font-semibold sm:text-xl">
          {oferta.titulo}
        </h2>
        {reciente && (
          <Badge variant="secondary" className="shrink-0">
            Nueva · {relativo}
          </Badge>
        )}
      </div>
      <DatosOferta rubros={oferta.rubros} lugar={oferta.lugar} jornada={oferta.jornada} sueldo={oferta.sueldo} compacto />
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarIcon aria-hidden="true" className="size-3.5 shrink-0 text-primary" />
          <span>
            Publicada el {formatearDia(oferta.publicadaEl)} ({relativo.toLowerCase()})
          </span>
        </p>
        {oferta.yaTePostulaste && (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            <CircleCheckIcon aria-hidden="true" className="size-4" />
            Te postulaste
          </p>
        )}
      </div>
    </TarjetaSeleccionable>
  );
}
