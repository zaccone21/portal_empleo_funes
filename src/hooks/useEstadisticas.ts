import { useEffect, useState } from "react";

import { getJson, mensajeDeError } from "@/lib/http";
import { estadisticasPublicasSchema, type EstadisticasPublicas } from "@/lib/validation/estadisticas";

/**
 * Loads the portal's public totals (P01, D-059) from GET /api/estadisticas.
 *
 * Returns:
 * - `estadisticas`: the totals, or null while they have not arrived;
 * - `loading`: true until the totals or an error arrive;
 * - `error`: the message, when they could not be counted.
 *
 * `vigente` discards the answer when the component was unmounted.
 */
export function useEstadisticas() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasPublicas | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;

    getJson("/api/estadisticas", estadisticasPublicasSchema)
      .then((datos) => {
        if (vigente) setEstadisticas(datos);
      })
      .catch((e: unknown) => {
        if (vigente) setError(mensajeDeError(e));
      });

    return () => {
      vigente = false;
    };
  }, []);

  return { estadisticas, loading: estadisticas === null && error === null, error };
}
