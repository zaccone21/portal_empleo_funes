"use client";

import { ErrorAlCargar } from "@/components/estados/ErrorAlCargar";
import { PedirIngreso } from "@/components/estados/PedirIngreso";
import { ListaConDetalle } from "@/components/marca/ListaConDetalle";
import { ItemNoDisponible } from "@/components/ofertas/ItemNoDisponible";
import { Skeleton } from "@/components/ui/skeleton";
import { useOfertasOficina } from "@/hooks/useOficina";
import { MENSAJE_ERROR_GENERICO } from "@/lib/http";
import { cn } from "@/lib/utils";
import type { EstadoOferta } from "@/lib/validation/ofertas";
import type { OfertaOficina } from "@/lib/validation/oficina";

import { DetalleOfertaOficina } from "./DetalleOfertaOficina";
import { PestanasEstado } from "./PestanasEstado";
import { TarjetaOfertaOficina } from "./TarjetaOfertaOficina";

const VACIO: Record<EstadoOferta, string> = {
  pendiente: "No hay ofertas para revisar. Está todo al día.",
  publicada: "No hay ofertas publicadas.",
  rechazada: "No hay ofertas rechazadas.",
  cerrada: "No hay ofertas cerradas.",
};

/**
 * Order inside each status, so what needs attention comes first:
 * - pendiente: oldest first (first in, first reviewed);
 * - publicada: the ones whose company asked to close them, then newest;
 * - rechazada and cerrada: newest first.
 */
function ordenar(ofertas: OfertaOficina[], estado: EstadoOferta): OfertaOficina[] {
  const copia = [...ofertas];
  if (estado === "pendiente") {
    return copia.sort((a, b) => a.creadaEl.localeCompare(b.creadaEl));
  }
  return copia.sort((a, b) => {
    if (estado === "publicada" && a.cierreSolicitado !== b.cierreSolicitado) {
      return a.cierreSolicitado ? -1 : 1;
    }
    return b.creadaEl.localeCompare(a.creadaEl);
  });
}

type Props = {
  /** Status tab from the URL (?estado=). */
  estado: EstadoOferta;
  /** Offer selected in the URL (?oferta=). */
  seleccionadaId?: string;
};

/**
 * "Gestión de ofertas" (P15, RF1.5.2–RF1.5.6): the offers split by status
 * (tabs), in a list with the detail on the same page (D-025). Loads every
 * offer once (useOfertasOficina) and splits them here, so each tab shows its
 * count and switching tabs does not load again.
 *
 * After a decision the offer changes status: it is updated in place
 * (`reemplazar`), so it leaves this tab's list and its count, while its detail
 * stays open showing the new status (a selected offer is looked up among all
 * of them, not only this tab's).
 */
export function GestionOfertas({ estado, seleccionadaId }: Props) {
  const { ofertas, loading, error, sinAcceso, recargar, reemplazar } = useOfertasOficina();

  if (loading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-4">
        <span className="sr-only" role="status">
          Cargando ofertas…
        </span>
        <Skeleton className="h-11 w-full max-w-xl rounded-full bg-card" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <Skeleton className="h-64 rounded-tl-2xl rounded-br-2xl bg-card" />
          <Skeleton className="hidden h-[28rem] rounded-tl-2xl rounded-br-2xl bg-card lg:block" />
        </div>
      </div>
    );
  }

  if (sinAcceso) {
    return (
      <PedirIngreso
        rol="admin"
        titulo="Ingresá con tu cuenta de la Oficina"
        descripcion="Esta sección es para el personal de la Oficina de Empleo."
      />
    );
  }

  if (error || !ofertas) {
    return <ErrorAlCargar que="las ofertas" mensaje={error ?? MENSAJE_ERROR_GENERICO} onReintentar={recargar} />;
  }

  const cantidades: Record<EstadoOferta, number> = { pendiente: 0, publicada: 0, rechazada: 0, cerrada: 0 };
  for (const oferta of ofertas) {
    cantidades[oferta.estado] += 1;
  }
  const delEstado = ordenar(
    ofertas.filter((oferta) => oferta.estado === estado),
    estado,
  );
  const eligio = seleccionadaId !== undefined;
  const enDetalle = eligio ? ofertas.find((oferta) => oferta.id === seleccionadaId) : delEstado[0];
  const volverHref = `/admin/ofertas?estado=${estado}`;

  return (
    <div className="flex flex-col gap-5">
      <div className={cn(eligio && "hidden lg:block")}>
        <PestanasEstado actual={estado} cantidades={cantidades} />
      </div>
      {delEstado.length === 0 && !eligio ? (
        <p className="rounded-tl-2xl rounded-br-2xl bg-card p-6 text-base text-muted-foreground">{VACIO[estado]}</p>
      ) : (
        <ListaConDetalle
          eligio={eligio}
          resumen={delEstado.length === 1 ? "1 oferta." : `${delEstado.length} ofertas.`}
          detalle={
            enDetalle ? (
              <DetalleOfertaOficina
                oferta={enDetalle}
                elegida={eligio}
                volverHref={volverHref}
                onActualizada={reemplazar}
              />
            ) : (
              <ItemNoDisponible
                titulo="No encontramos esa oferta"
                descripcion="Elegí una de la lista."
                volverHref={volverHref}
                volverTexto="Ver la lista"
              />
            )
          }
        >
          {delEstado.map((oferta) => (
            <li key={oferta.id}>
              <TarjetaOfertaOficina
                oferta={oferta}
                href={`/admin/ofertas?estado=${estado}&oferta=${encodeURIComponent(oferta.id)}`}
                seleccionada={oferta.id === enDetalle?.id}
                soloEnEscritorio={!eligio}
              />
            </li>
          ))}
        </ListaConDetalle>
      )}
    </div>
  );
}
