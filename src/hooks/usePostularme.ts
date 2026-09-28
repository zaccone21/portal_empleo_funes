import { useState } from "react";

import { ErrorHttp, mensajeDeError, sendJson } from "@/lib/http";

/**
 * What happened after pressing "Postularme". Each case gets its own message
 * on screen (see AvisoPostulacion).
 */
export type ResultadoPostulacion =
  | { tipo: "postulado" }
  | { tipo: "sin_sesion" }
  | { tipo: "falta_cv"; mensaje: string }
  | { tipo: "error"; mensaje: string };

/**
 * Applies to an offer (P06, RF1.4.3) through POST /api/postulaciones.
 *
 * Contract (D-024):
 * - 201: applied. Also when the applicant had already applied: the server
 *   treats it as done instead of an error, because for the person the result
 *   is the same.
 * - 401: nobody logged in → "sin_sesion" (the screen offers to log in).
 * - 409: the applicant has no CV (RF1.4.4) → "falta_cv" with the server's
 *   message (the screen links to the CV upload, P04).
 * - anything else → "error" with the message (D-013).
 *
 * The result stays in `resultado` so the screen can replace the button with
 * the outcome.
 */
export function usePostularme() {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResultadoPostulacion | null>(null);

  async function postularme(ofertaId: string) {
    setLoading(true);
    setResultado(null);
    try {
      await sendJson("/api/postulaciones", { body: { ofertaId } });
      setResultado({ tipo: "postulado" });
    } catch (e) {
      setResultado(clasificarError(e));
    } finally {
      setLoading(false);
    }
  }

  return { postularme, loading, resultado };
}

function clasificarError(e: unknown): ResultadoPostulacion {
  if (e instanceof ErrorHttp && e.status === 401) {
    return { tipo: "sin_sesion" };
  }
  if (e instanceof ErrorHttp && e.status === 409) {
    return { tipo: "falta_cv", mensaje: e.message };
  }
  return { tipo: "error", mensaje: mensajeDeError(e) };
}
