"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { BotonAdmin } from "@/components/admin/boton-admin";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useUrlAdmin } from "@/hooks/useUrlAdmin";
import {
  aprobarOfertaAccion,
  aprobarOfertasLoteAccion,
  cerrarOfertaAccion,
  rechazarOfertaAccion,
  type RespuestaAccion,
} from "@/lib/actions/oficina";
import type { EstadoOferta } from "@/lib/validation/ofertas";

type Props = {
  id: string;
  estado: EstadoOferta;
  cierreSolicitado: boolean;
  /** Row to select after resolving, when the screen is a queue (undefined = none left). */
  siguienteId?: string;
  /** In queues the selection moves on by itself after a decision. */
  avanzar?: boolean;
};

/**
 * Actions of an offer inside the panel (RF1.5.3, RF1.5.4; D-042). Approving is
 * one click with a toast; rejecting (with the reason the company will read) and
 * closing ask for confirmation. The server decides if the move is still valid:
 * when another operator got there first, the toast says so.
 */
export function AccionesOferta({ id, estado, cierreSolicitado, siguienteId, avanzar = false }: Props) {
  const { ir } = useUrlAdmin();
  const [pendiente, iniciar] = useTransition();

  async function ejecutar(accion: () => Promise<RespuestaAccion>) {
    const respuesta = await accion();
    if (respuesta.ok) {
      toast.success(respuesta.mensaje);
      if (avanzar) ir({ sel: siguienteId });
    } else {
      toast.error(respuesta.mensaje);
      ir({});
    }
  }

  if (estado === "pendiente") {
    return (
      <>
        <BotonAdmin variante="primario" disabled={pendiente} onClick={() => iniciar(() => ejecutar(() => aprobarOfertaAccion(id)))}>
          Aprobar
        </BotonAdmin>
        <ConfirmDialog
          trigger={<BotonAdmin variante="destructivo">Rechazar</BotonAdmin>}
          titulo="¿Rechazar esta oferta?"
          descripcion="La empresa va a leer el motivo. Escribilo claro para que pueda corregir la oferta."
          textoConfirmar="Rechazar oferta"
          varianteConfirmar="destructive"
          requiereMotivo
          etiquetaMotivo="Motivo del rechazo"
          onConfirmar={(motivo) => ejecutar(() => rechazarOfertaAccion(id, motivo ?? ""))}
        />
      </>
    );
  }

  if (estado === "publicada" && cierreSolicitado) {
    return (
      <ConfirmDialog
        trigger={<BotonAdmin variante="primario">Cerrar oferta</BotonAdmin>}
        titulo="¿Cerrar esta oferta?"
        descripcion="La oferta deja de verse en el portal. Esta acción no se puede deshacer."
        textoConfirmar="Cerrar oferta"
        onConfirmar={() => ejecutar(() => cerrarOfertaAccion(id))}
      />
    );
  }

  return null;
}

/** Bulk approval bar button: confirms with the amount and reports the result per offer. */
export function AprobarSeleccionadas({ ids, limpiar }: { ids: string[]; limpiar: () => void }) {
  const { ir } = useUrlAdmin();

  async function aprobar() {
    const respuesta = await aprobarOfertasLoteAccion(ids);
    if (!respuesta.ok) {
      toast.error(respuesta.mensaje);
      return;
    }
    if (respuesta.fallidas > 0) toast.warning(respuesta.mensaje);
    else toast.success(respuesta.mensaje);
    limpiar();
    ir({ sel: undefined });
  }

  return (
    <ConfirmDialog
      trigger={<BotonAdmin variante="primario">Aprobar seleccionadas</BotonAdmin>}
      titulo={`¿Aprobar ${ids.length} ${ids.length === 1 ? "oferta" : "ofertas"}?`}
      descripcion="Las ofertas pasan a verse en el portal para los postulantes."
      textoConfirmar={`Aprobar ${ids.length}`}
      onConfirmar={aprobar}
    />
  );
}
