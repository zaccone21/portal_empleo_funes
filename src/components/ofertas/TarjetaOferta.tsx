import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

import { formatearDia } from "@/lib/fechas";
import { cn } from "@/lib/utils";
import type { OfertaPublica } from "@/lib/validation/ofertas";

import { DatosOferta } from "./DatosOferta";

type Props = {
  oferta: OfertaPublica;
  /** This offer's detail is the one on screen. */
  seleccionada: boolean;
  /**
   * The highlight only applies from `lg` up. Used when nobody picked an offer
   * yet: on desktop the first offer's detail is shown next to the list, while
   * on a phone only the list is visible and nothing should look selected.
   */
  soloEnEscritorio: boolean;
};

/**
 * One offer in the list (P05, RF1.4.1). The whole card is a link to
 * /ofertas?oferta=<id>: it opens the detail next to the list (desktop) or in
 * place of the list (phone), without a modal (D-025). Being a real link, the
 * back button returns to the list and the offer can be shared.
 *
 * `scroll={false}` keeps the list where it was on desktop; on phones the
 * detail scrolls itself into view (see DetalleOferta).
 */
export function TarjetaOferta({ oferta, seleccionada, soloEnEscritorio }: Props) {
  const resaltado = "ring-2 ring-primary bg-secondary";

  return (
    <Link
      href={`/ofertas?oferta=${encodeURIComponent(oferta.id)}`}
      scroll={false}
      aria-current={seleccionada && !soloEnEscritorio ? "true" : undefined}
      className={cn(
        "group flex items-start gap-3 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-card p-4 ring-1 ring-foreground/5 outline-none sm:p-5",
        "hover:ring-foreground/20 focus-visible:ring-3 focus-visible:ring-ring/50",
        seleccionada && (soloEnEscritorio ? "lg:ring-2 lg:ring-primary lg:bg-secondary" : resaltado),
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <h2 className="font-heading text-lg leading-snug font-semibold sm:text-xl">{oferta.titulo}</h2>
        <DatosOferta lugar={oferta.lugar} jornada={oferta.jornada} />
        <p className="text-sm text-muted-foreground">Publicada el {formatearDia(oferta.publicadaEl)}</p>
      </div>
      <ChevronRightIcon aria-hidden="true" className="mt-1 size-5 shrink-0 text-muted-foreground" />
    </Link>
  );
}
