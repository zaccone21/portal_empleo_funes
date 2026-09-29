import { useEffect, useState } from "react";

import { esSinAcceso, getJson, mensajeDeError } from "@/lib/http";
import { listaOfertasEmpresaSchema, type OfertaEmpresa } from "@/lib/validation/ofertas";

/**
 * The logged-in company's offers with their status (P09, P12) from
 * GET /api/empresa/ofertas (D-027). Only its own offers, and never anything
 * about applicants.
 *
 * Returns `ofertas`, `loading`, `error` and `recargar` as in
 * useOfertasPublicadas; `sinAcceso` for 401 or 403 (the screen asks to log in
 * as a company); and `reemplazar(oferta)`: puts the new version of one
 * offer in the list (for example after asking to close it), so the screen
 * updates without loading everything again.
 */
export function useOfertasEmpresa() {
  const [ofertas, setOfertas] = useState<OfertaEmpresa[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sinAcceso, setSinAcceso] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;

    getJson("/api/empresa/ofertas", listaOfertasEmpresaSchema)
      .then((lista) => {
        if (vigente) setOfertas(lista);
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
  }, [intento]);

  function recargar() {
    setOfertas(null);
    setError(null);
    setSinAcceso(false);
    setIntento((n) => n + 1);
  }

  function reemplazar(actualizada: OfertaEmpresa) {
    setOfertas((lista) => lista?.map((oferta) => (oferta.id === actualizada.id ? actualizada : oferta)) ?? null);
  }

  return {
    ofertas,
    loading: ofertas === null && error === null && !sinAcceso,
    error,
    sinAcceso,
    recargar,
    reemplazar,
  };
}
