import { InboxIcon } from "lucide-react";

import { TarjetaSeleccionable } from "@/components/marca/TarjetaSeleccionable";
import { Badge } from "@/components/ui/badge";
import { formatearDia } from "@/lib/fechas";
import type { OfertaOficina } from "@/lib/validation/oficina";

type Props = {
  oferta: OfertaOficina;
  href: string;
  seleccionada: boolean;
  soloEnEscritorio: boolean;
};

/**
 * One offer in the Office's list (P15): which company, the job title, when it
 * arrived (or was published), and what needs attention: a close request
 * (RF1.5.4) and how many applications it has (RF1.5.5).
 */
export function TarjetaOfertaOficina({ oferta, href, seleccionada, soloEnEscritorio }: Props) {
  const fecha = oferta.publicadaEl ? `Publicada el ${formatearDia(oferta.publicadaEl)}` : `Enviada el ${formatearDia(oferta.creadaEl)}`;

  return (
    <TarjetaSeleccionable href={href} seleccionada={seleccionada} soloEnEscritorio={soloEnEscritorio}>
      <p className="text-sm font-medium text-muted-foreground">{oferta.empresa?.razonSocial ?? oferta.emailEmpresa}</p>
      <h2 className="-mt-2 font-heading text-lg leading-snug font-semibold">{oferta.titulo}</h2>
      <div className="flex flex-wrap items-center gap-2">
        {oferta.estado === "publicada" && oferta.cierreSolicitado && (
          <Badge variant="destructive" className="h-7 px-2.5 text-sm">
            Pidió el cierre
          </Badge>
        )}
        {(oferta.estado === "publicada" || oferta.estado === "cerrada") && (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <InboxIcon aria-hidden="true" className="size-4" />
            {oferta.cantidadPostulaciones === 1 ? "1 postulación" : `${oferta.cantidadPostulaciones} postulaciones`}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{fecha}</p>
    </TarjetaSeleccionable>
  );
}
