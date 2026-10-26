import { useState } from "react";

import { ErrorHttp, esSinAcceso, mensajeDeError, sendJson } from "@/lib/http";

/**
 * What happened after pressing "Postularme". Each case gets its own message
 * on screen (see AvisoPostulacion).
 */
export type ResultadoPostulacion =
  | { tipo: "postulado" }
  | { tipo: "sin_sesion" }
  | { tipo: "falta_perfil"; mensaje: string }
  | { tipo: "falta_cv"; mensaje: string }
  | { tipo: "error"; mensaje: string };

/**
 * Applies to an offer (P06, RF1.4.3) through POST /api/postulaciones.
 *
 * Contract (D-024):
 * - 201: applied. Also when the applicant had already applied: the server
 *   treats it as done instead of an error, because for the person the result
 *   is the same.
 * - 401 (nobody logged in) or 403 (logged in as a company or the Office) →
 *   "sin_sesion": the screen offers to log in as an applicant.
 * - 409: either the applicant's profile is incomplete ("falta_perfil", links
 *   to P03) or they have no CV ("falta_cv", RF1.4.4, links to P04 #cv).
 * - anything else → "error" with the message (D-013).
 *
 * `postularme` resolves to the result too, so the caller can react (for
 * example, mark the offer as applied in the list). It also stays in
 * `resultado` so the screen can replace the button with the outcome.
 */
export function usePostularme() {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResultadoPostulacion | null>(null);

  async function postularme(ofertaId: string): Promise<ResultadoPostulacion> {
    setLoading(true);
    setResultado(null);
    let nuevo: ResultadoPostulacion;
    try {
      await sendJson("/api/postulaciones", { body: { ofertaId } });
      nuevo = { tipo: "postulado" };
    } catch (e) {
      nuevo = clasificarError(e);
    }
    setResultado(nuevo);
    setLoading(false);
    return nuevo;
  }

  return { postularme, loading, resultado };
}

function clasificarError(e: unknown): ResultadoPostulacion {
  if (esSinAcceso(e)) {
    return { tipo: "sin_sesion" };
  }
  if (e instanceof ErrorHttp && e.status === 409) {
    if (/datos personales|mi perfil/i.test(e.message)) {
      return { tipo: "falta_perfil", mensaje: e.message };
    }
    return { tipo: "falta_cv", mensaje: e.message };
  }
  return { tipo: "error", mensaje: mensajeDeError(e) };
}
