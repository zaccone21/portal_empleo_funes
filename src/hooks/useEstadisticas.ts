import { useEffect, useRef, useState } from "react";

import { getJson, mensajeDeError } from "@/lib/http";
import { estadisticasPublicasSchema, type EstadisticasPublicas } from "@/lib/validation/estadisticas";

/**
 * Loads the portal's public totals (P01, D-059) from GET /api/estadisticas.
 *
 * `actualizarCadaMs` (optional) asks again every so often, but only while the
 * tab is on screen, and once more when the person comes back to it, so a new
 * hire shows up without reloading (D-066). The server lets the CDN keep the
 * answer for a minute, so many open tabs do not reach the database.
 *
 * Returns:
 * - `estadisticas`: the totals, or null while they have not arrived;
 * - `loading`: true until the totals or an error arrive;
 * - `error`: the message, when the first load failed. A later failed refresh
 *   keeps the last totals on screen instead of hiding them.
 *
 * `vigente` discards answers that arrive after the component was unmounted.
 */
export function useEstadisticas(actualizarCadaMs?: number) {
  const [estadisticas, setEstadisticas] = useState<EstadisticasPublicas | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cargadas = useRef(false);

  useEffect(() => {
    let vigente = true;

    function cargar() {
      getJson("/api/estadisticas", estadisticasPublicasSchema)
        .then((datos) => {
          if (!vigente) return;
          cargadas.current = true;
          setEstadisticas(datos);
        })
        .catch((e: unknown) => {
          if (vigente && !cargadas.current) setError(mensajeDeError(e));
        });
    }

    function siEstaAlaVista() {
      if (document.visibilityState === "visible") cargar();
    }

    cargar();
    if (!actualizarCadaMs) {
      return () => {
        vigente = false;
      };
    }

    const intervalo = setInterval(siEstaAlaVista, actualizarCadaMs);
    document.addEventListener("visibilitychange", siEstaAlaVista);
    return () => {
      vigente = false;
      clearInterval(intervalo);
      document.removeEventListener("visibilitychange", siEstaAlaVista);
    };
  }, [actualizarCadaMs]);

  return { estadisticas, loading: estadisticas === null && error === null, error };
}
