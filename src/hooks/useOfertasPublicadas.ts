import { useEffect, useState } from "react";

import { getJson, mensajeDeError } from "@/lib/http";
import { listaOfertasSchema, type OfertaPublica } from "@/lib/validation/ofertas";

/**
 * Loads the published job offers (P05) from GET /api/ofertas. The endpoint is
 * public: anyone can see the list (RF1.4.1, D-024).
 *
 * Returns:
 * - `ofertas`: the list, or null while it has not arrived;
 * - `loading`: true until the list or an error arrives;
 * - `error`: the message to show (D-013);
 * - `recargar`: tries again (the error screen's "Probar de nuevo").
 *
 * `loading` is derived instead of stored: the effect only sets state after
 * the request answers, which is what React's rules for effects ask for.
 * `vigente` discards the answer of a request that was superseded by
 * `recargar` or whose component was unmounted.
 */
export function useOfertasPublicadas() {
  const [ofertas, setOfertas] = useState<OfertaPublica[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;

    getJson("/api/ofertas", listaOfertasSchema)
      .then((lista) => {
        if (vigente) setOfertas(lista);
      })
      .catch((e: unknown) => {
        if (vigente) setError(mensajeDeError(e));
      });

    return () => {
      vigente = false;
    };
  }, [intento]);

  function recargar() {
    setOfertas(null);
    setError(null);
    setIntento((n) => n + 1);
  }

  return { ofertas, loading: ofertas === null && error === null, error, recargar };
}
