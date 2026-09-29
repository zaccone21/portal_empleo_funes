import { useEffect, useState } from "react";

import { esSinAcceso, getJson, mensajeDeError, sendFormData } from "@/lib/http";
import { respuestaCvSchema, type CvPropio } from "@/lib/validation/cv";

/**
 * The applicant's CV (P04, RF1.2.3) through /api/cv (D-026).
 *
 * Loading (GET):
 * - `cv`: the current CV, null if there is none, undefined while loading;
 * - `sinAcceso`: 401 or 403, the screen asks to log in (as in useMisPostulaciones);
 * - `loading`, `error`, `recargar`: as in useOfertasPublicadas.
 *
 * Uploading (PUT, multipart/form-data with the field "archivo"):
 * - `subir(archivo)` resolves to true when it worked; the new CV replaces
 *   `cv` right away, without reloading;
 * - `subiendo` and `errorSubida` belong to the upload only, so a failed
 *   upload does not hide the CV that is already saved.
 * The upload is asynchronous (RF1.2.3): the page stays usable while it runs.
 */
export function useMiCv() {
  const [cv, setCv] = useState<CvPropio | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [sinAcceso, setSinAcceso] = useState(false);
  const [intento, setIntento] = useState(0);
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;

    getJson("/api/cv", respuestaCvSchema)
      .then((respuesta) => {
        if (vigente) setCv(respuesta.cv);
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
    setCv(undefined);
    setError(null);
    setSinAcceso(false);
    setIntento((n) => n + 1);
  }

  async function subir(archivo: File): Promise<boolean> {
    setSubiendo(true);
    setErrorSubida(null);
    try {
      const formulario = new FormData();
      formulario.append("archivo", archivo);
      const respuesta = await sendFormData("/api/cv", formulario, respuestaCvSchema);
      setCv(respuesta.cv);
      return true;
    } catch (e) {
      setErrorSubida(mensajeDeError(e));
      return false;
    } finally {
      setSubiendo(false);
    }
  }

  return {
    cv,
    loading: cv === undefined && error === null && !sinAcceso,
    error,
    sinAcceso,
    recargar,
    subir,
    subiendo,
    errorSubida,
  };
}
