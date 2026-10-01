import { useEffect, useState } from "react";

import { esSinAcceso, getJson, mensajeDeError } from "@/lib/http";
import { listaPostulacionesSchema, type PostulacionPropia } from "@/lib/validation/postulaciones";

/**
 * Loads the logged-in applicant's applications (P07) from GET /api/postulaciones.
 * The server takes the applicant from the session and returns only theirs,
 * without any status (RF1.2.4, D-024).
 *
 * Returns:
 * - `postulaciones`: the list, or null while it has not arrived;
 * - `sinAcceso`: true when the server answered 401 (nobody logged in) or 403
 *   (logged in with another role); the screen then offers to log in instead
 *   of showing an error;
 * - `loading`, `error` and `recargar`: as in useOfertasPublicadas.
 */
export function useMisPostulaciones() {
  const [postulaciones, setPostulaciones] = useState<PostulacionPropia[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sinAcceso, setSinAcceso] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;

    getJson("/api/postulaciones", listaPostulacionesSchema)
      .then((lista) => {
        if (vigente) setPostulaciones(lista);
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
    setPostulaciones(null);
    setError(null);
    setSinAcceso(false);
    setIntento((n) => n + 1);
  }

  return {
    postulaciones,
    loading: postulaciones === null && error === null && !sinAcceso,
    error,
    sinAcceso,
    recargar,
  };
}
