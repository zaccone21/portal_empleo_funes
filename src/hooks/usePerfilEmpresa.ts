import { useEffect, useState } from "react";

import { esSinAcceso, getJson, mensajeDeError, sendJson } from "@/lib/http";
import { respuestaPerfilEmpresaSchema, type PerfilEmpresa } from "@/lib/validation/empresa";

/**
 * The logged-in company's data (P10, RF1.3.2) through /api/empresa/perfil (D-027).
 *
 * Loading (GET):
 * - `perfil`: the saved data, null if the company never filled it in,
 *   undefined while loading;
 * - `sinAcceso`: 401 or 403, the screen asks to log in as a company;
 * - `loading`, `error`, `recargar`: as in useOfertasPublicadas.
 *
 * Saving (PUT):
 * - `guardar(datos)` resolves to true when it worked and replaces `perfil`
 *   with what the server saved (for example the CUIT with dashes);
 * - `guardando` and `errorGuardado` belong to the save only, so a failed save
 *   keeps the form on screen with the message.
 */
export function usePerfilEmpresa() {
  const [perfil, setPerfil] = useState<PerfilEmpresa | null | undefined>(undefined);
  const [cuitRegistrado, setCuitRegistrado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sinAcceso, setSinAcceso] = useState(false);
  const [intento, setIntento] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;

    getJson("/api/empresa/perfil", respuestaPerfilEmpresaSchema)
      .then((respuesta) => {
        if (vigente) {
          setPerfil(respuesta.perfil);
          setCuitRegistrado(respuesta.cuit ?? null);
        }
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
    setPerfil(undefined);
    setCuitRegistrado(null);
    setError(null);
    setSinAcceso(false);
    setIntento((n) => n + 1);
  }

  async function guardar(datos: PerfilEmpresa): Promise<boolean> {
    setGuardando(true);
    setErrorGuardado(null);
    try {
      const respuesta = await sendJson("/api/empresa/perfil", {
        method: "PUT",
        body: datos,
        responseSchema: respuestaPerfilEmpresaSchema,
      });
      setPerfil(respuesta.perfil);
      setCuitRegistrado(respuesta.cuit ?? null);
      return true;
    } catch (e) {
      setErrorGuardado(mensajeDeError(e));
      return false;
    } finally {
      setGuardando(false);
    }
  }

  return {
    perfil,
    cuitRegistrado,
    loading: perfil === undefined && error === null && !sinAcceso,
    error,
    sinAcceso,
    recargar,
    guardar,
    guardando,
    errorGuardado,
  };
}
