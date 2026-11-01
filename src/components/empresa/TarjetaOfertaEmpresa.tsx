import { TarjetaSeleccionable } from "@/components/marca/TarjetaSeleccionable";
import { EstadoOferta } from "@/components/ofertas/EstadoOferta";
import { IconoRubro } from "@/components/ofertas/IconoRubro";
import { formatearDia } from "@/lib/fechas";
import type { OfertaEmpresa } from "@/lib/validation/ofertas";
import { NOMBRE_RUBRO } from "@/lib/validation/rubros";

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
  const rubros = oferta.rubros ?? [];

  return (
    <TarjetaSeleccionable
      href={`/empresa/ofertas?oferta=${encodeURIComponent(oferta.id)}`}
      seleccionada={seleccionada}
      soloEnEscritorio={soloEnEscritorio}
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <EstadoOferta estado={oferta.estado} />
          {oferta.cierreSolicitado && oferta.estado === "publicada" && (
            <span className="rounded-full bg-attention/15 px-2 py-0.5 text-xs font-semibold text-attention-foreground">
              Pediste el cierre
            </span>
          )}
        </div>

        <h2 className="line-clamp-2 min-h-[3rem] font-heading text-lg leading-snug font-semibold sm:text-xl text-foreground">
          {oferta.titulo}
        </h2>

        {rubros.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {rubros.slice(0, 2).map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
              >
                <IconoRubro rubro={r} className="size-3 text-primary" />
                {NOMBRE_RUBRO[r]}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-2.5 text-xs text-muted-foreground">
        <span>Enviada el {formatearDia(oferta.creadaEl)}</span>
      </div>
    </TarjetaSeleccionable>
  );
}
