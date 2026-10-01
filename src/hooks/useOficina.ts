import { useState } from "react";

import { mensajeDeError, sendJson } from "@/lib/http";
import {
  listaOfertasOficinaSchema,
  listaPostulacionesOficinaSchema,
  respuestaOfertaOficinaSchema,
  respuestaPostulacionOficinaSchema,
  resumenOficinaSchema,
  type OfertaOficina,
} from "@/lib/validation/oficina";
import type { EstadoPostulacion } from "@/lib/validation/postulaciones";

import { useDatos } from "./useDatos";

/*
 * Hooks of the Employment Office screens (P14, P15; D-030), grouped in one
 * file because they share the same contract under /api/admin/.
 */

/** The panel's indicators (P14) from GET /api/admin/resumen. */
export function useResumenOficina() {
  const { datos, ...estado } = useDatos("/api/admin/resumen", resumenOficinaSchema);
  return { resumen: datos, ...estado };
}

/**
 * Every offer, in every status (P15), from GET /api/admin/ofertas.
 * `reemplazar(oferta)` puts the new version of one offer in the list after an
 * action (publish, reject, close), so it moves to its new tab at once.
 */
export function useOfertasOficina() {
  const { datos, setDatos, ...estado } = useDatos("/api/admin/ofertas", listaOfertasOficinaSchema);

  function reemplazar(actualizada: OfertaOficina) {
    setDatos((lista) => lista?.map((oferta) => (oferta.id === actualizada.id ? actualizada : oferta)));
  }

  return { ofertas: datos, reemplazar, ...estado };
}

type Accion =
  | { tipo: "publicar" }
  | { tipo: "rechazar"; motivo: string }
  | { tipo: "cerrar" };

const RUTA_ACCION: Record<Accion["tipo"], string> = {
  publicar: "publicacion",
  rechazar: "rechazo",
  cerrar: "cierre",
};

/**
 * The Office's decisions on an offer (RF1.5.3, RF1.5.4):
 * - publicar: POST …/publicacion (pending → published);
 * - rechazar: POST …/rechazo `{ motivo }` (pending → rejected; the reason is required);
 * - cerrar: POST …/cierre (published with a close request → closed).
 * `moderar` resolves to the updated offer, or undefined with the message in
 * `error` (D-013), for example 409 when another operator already decided.
 */
export function useModerarOferta() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function moderar(ofertaId: string, accion: Accion): Promise<OfertaOficina | undefined> {
    setLoading(true);
    setError(null);
    try {
      const { oferta } = await sendJson(
        `/api/admin/ofertas/${encodeURIComponent(ofertaId)}/${RUTA_ACCION[accion.tipo]}`,
        {
          body: accion.tipo === "rechazar" ? { motivo: accion.motivo } : {},
          responseSchema: respuestaOfertaOficinaSchema,
        },
      );
      return oferta;
    } catch (e) {
      setError(mensajeDeError(e));
      return undefined;
    } finally {
      setLoading(false);
    }
  }

  return { moderar, loading, error };
}

/**
 * The applications of one offer (RF1.5.5) and the change of their status
 * (RF1.5.6, PATCH /api/admin/postulaciones/<id>). After a change the row
 * updates in place; `errorCambio` belongs to the change only, so a failed
 * change does not hide the list.
 */
export function usePostulacionesOficina(ofertaId: string) {
  const { datos, setDatos, ...estado } = useDatos(
    `/api/admin/ofertas/${encodeURIComponent(ofertaId)}/postulaciones`,
    listaPostulacionesOficinaSchema,
  );
  const [errorCambio, setErrorCambio] = useState<string | null>(null);

  async function cambiarEstado(postulacionId: string, nuevo: EstadoPostulacion): Promise<boolean> {
    setErrorCambio(null);
    try {
      const { postulacion } = await sendJson(`/api/admin/postulaciones/${encodeURIComponent(postulacionId)}`, {
        method: "PATCH",
        body: { estado: nuevo },
        responseSchema: respuestaPostulacionOficinaSchema,
      });
      setDatos((lista) => lista?.map((p) => (p.id === postulacion.id ? postulacion : p)));
      return true;
    } catch (e) {
      setErrorCambio(mensajeDeError(e));
      return false;
    }
  }

  return { postulaciones: datos, cambiarEstado, errorCambio, ...estado };
}
