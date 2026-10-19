import { useState } from "react";

import { mensajeDeError, sendJson } from "@/lib/http";
import {
  respuestaCandidatoSchema,
  type CandidatoDerivado,
  type DatosDecisionCandidato,
} from "@/lib/validation/candidatos";

/**
 * "Contratar" / "No contratar" a referred applicant (P17, RF1.6.4, D-044)
 * through POST /api/empresa/candidatos/<id>/decision. It is answered once.
 *
 * `decidir` resolves to the candidate with its decision, or `undefined` with
 * the message in `error` (D-013), for example 409 when it was already answered.
 */
export function useDecidirCandidato() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decidir(postulacionId: string, datos: DatosDecisionCandidato): Promise<CandidatoDerivado | undefined> {
    setLoading(true);
    setError(null);
    try {
      const { candidato } = await sendJson(`/api/empresa/candidatos/${encodeURIComponent(postulacionId)}/decision`, {
        body: datos,
        responseSchema: respuestaCandidatoSchema,
      });
      return candidato;
    } catch (e) {
      setError(mensajeDeError(e));
      return undefined;
    } finally {
      setLoading(false);
    }
  }

  return { decidir, loading, error };
}
