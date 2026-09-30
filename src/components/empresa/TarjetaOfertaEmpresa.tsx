import { TarjetaSeleccionable } from "@/components/marca/TarjetaSeleccionable";
import { EstadoOferta } from "@/components/ofertas/EstadoOferta";
import { formatearDia } from "@/lib/fechas";
import type { OfertaEmpresa } from "@/lib/validation/ofertas";

type Props = {
  oferta: OfertaEmpresa;
  seleccionada: boolean;
  /** Highlight only on desktop (nothing was picked yet); see TarjetaSeleccionable. */
  soloEnEscritorio: boolean;
};

/**
 * One of the company's offers in "Mis ofertas" (P12): title, status
 * (RF1.3.4), send date and, if it applies, that the company asked to close
 * it. The card opens the detail on the same page (/empresa/ofertas?oferta=<id>).
 */
export function TarjetaOfertaEmpresa({ oferta, seleccionada, soloEnEscritorio }: Props) {
  return (
    <TarjetaSeleccionable
      href={`/empresa/ofertas?oferta=${encodeURIComponent(oferta.id)}`}
      seleccionada={seleccionada}
      soloEnEscritorio={soloEnEscritorio}
    >
      <div className="flex flex-wrap items-center gap-2">
        <EstadoOferta estado={oferta.estado} />
        {oferta.cierreSolicitado && oferta.estado === "publicada" && (
          <span className="text-sm text-muted-foreground">Pediste el cierre</span>
        )}
      </div>
      <h2 className="font-heading text-lg leading-snug font-semibold sm:text-xl">{oferta.titulo}</h2>
      <p className="text-sm text-muted-foreground">Enviada el {formatearDia(oferta.creadaEl)}</p>
    </TarjetaSeleccionable>
  );
}
