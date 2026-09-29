import { useEffect, useState } from "react";
import type { z } from "zod";

import { esSinAcceso, getJson, mensajeDeError } from "@/lib/http";

/**
 * Loads data with GET from `url`, validated with `schema`, and keeps it in
 * state. It is the shared "load" part of the Office hooks (D-030); the older
 * hooks follow the same pattern written by hand.
 *
 * Returns:
 * - `datos`: the data, or undefined while loading (or when it failed);
 * - `setDatos`: to update what is on screen after an action, without loading
 *   again (for example after publishing an offer);
 * - `loading`, `error` (D-013), `sinAcceso` (401 or 403: the screen asks to
 *   log in) and `recargar` (tries again).
 *
 * `vigente` discards the answer of a request that was superseded (another
 * `url`, or `recargar`) or whose component was unmounted. `loading` is derived
 * instead of stored, so the effect only sets state after the answer arrives.
 */
export function useDatos<T>(url: string, schema: z.ZodType<T>) {
  const [datos, setDatos] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [sinAcceso, setSinAcceso] = useState(false);
  const [intento, setIntento] = useState(0);
  const [urlCargada, setUrlCargada] = useState(url);

  // A new url starts from scratch (for example another offer's applicants).
  if (urlCargada !== url) {
    setUrlCargada(url);
    setDatos(undefined);
    setError(null);
    setSinAcceso(false);
  }

  useEffect(() => {
    let vigente = true;

    getJson(url, schema)
      .then((respuesta) => {
        if (vigente) setDatos(respuesta);
      })
      .catch((e: unknown) => {
        if (!vigente) return;
        if (esSinAcceso(e)) {
          setSinAcceso(true);
        } else {
          setError(mensajeDeError(e));
        }
      });

    return () => {
      vigente = false;
    };
  }, [url, schema, intento]);

  function recargar() {
    setDatos(undefined);
    setError(null);
    setSinAcceso(false);
    setIntento((n) => n + 1);
  }

  return {
    datos,
    setDatos,
    loading: datos === undefined && error === null && !sinAcceso,
    error,
    sinAcceso,
    recargar,
  };
}
