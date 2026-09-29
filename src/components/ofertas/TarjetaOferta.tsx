import { CircleCheckIcon } from "lucide-react";

import { TarjetaSeleccionable } from "@/components/marca/TarjetaSeleccionable";
import { formatearDia } from "@/lib/fechas";
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
 * publication date, plus "Te postulaste" when the logged-in applicant already
 * applied (D-028). The card is a link that opens the detail on the same page
 * (D-025) and keeps the search and filters in the URL, so going back returns
 * to the same results.
 */
export function TarjetaOferta({ oferta, href, seleccionada, soloEnEscritorio }: Props) {
  return (
    <TarjetaSeleccionable href={href} seleccionada={seleccionada} soloEnEscritorio={soloEnEscritorio}>
      <h2 className="font-heading text-lg leading-snug font-semibold sm:text-xl">{oferta.titulo}</h2>
      <DatosOferta rubro={oferta.rubro} lugar={oferta.lugar} jornada={oferta.jornada} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Publicada el {formatearDia(oferta.publicadaEl)}</p>
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
