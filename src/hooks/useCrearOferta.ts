import { useState } from "react";

import { mensajeDeError, sendJson } from "@/lib/http";
import {
  respuestaOfertaEmpresaSchema,
  type DatosNuevaOferta,
  type OfertaEmpresa,
} from "@/lib/validation/ofertas";

/**
 * Sends a new offer (P11, RF1.3.3) through POST /api/empresa/ofertas (D-027).
 * The server creates it as "pendiente" (no drafts, D-007).
 *
 * `crear` resolves to the created offer, or `undefined` with the message in
 * `error` (D-013). As in useIngreso, `loading` stays true after a success
 * because the page navigates to the new offer right away.
 */
export function useCrearOferta() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function crear(datos: DatosNuevaOferta): Promise<OfertaEmpresa | undefined> {
    setLoading(true);
    setError(null);
    try {
      const { oferta } = await sendJson("/api/empresa/ofertas", {
        body: datos,
        responseSchema: respuestaOfertaEmpresaSchema,
      });
      return oferta;
    } catch (e) {
      setError(mensajeDeError(e));
      setLoading(false);
      return undefined;
    }
  }

  return { crear, loading, error };
}
