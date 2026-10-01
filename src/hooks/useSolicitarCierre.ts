import { useState } from "react";

import { mensajeDeError, sendJson } from "@/lib/http";
import { respuestaOfertaEmpresaSchema, type OfertaEmpresa } from "@/lib/validation/ofertas";

/**
 * Asks the Office to close a published offer (P12, RF1.3.6) through
 * POST /api/empresa/ofertas/<id>/solicitud-cierre (D-027). The offer stays
 * published until the Office closes it; the answer brings it with
 * `cierreSolicitado: true`.
 *
 * `solicitar` resolves to the updated offer, or `undefined` with the message
 * in `error` (D-013), for example 409 when the offer is no longer published.
 */
export function useSolicitarCierre() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function solicitar(ofertaId: string): Promise<OfertaEmpresa | undefined> {
    setLoading(true);
    setError(null);
    try {
      const { oferta } = await sendJson(
        `/api/empresa/ofertas/${encodeURIComponent(ofertaId)}/solicitud-cierre`,
        { body: {}, responseSchema: respuestaOfertaEmpresaSchema },
      );
      return oferta;
    } catch (e) {
      setError(mensajeDeError(e));
      return undefined;
    } finally {
      setLoading(false);
    }
  }

  return { solicitar, loading, error };
}
