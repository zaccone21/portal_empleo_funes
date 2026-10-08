import { useState } from "react";

import { useDatos } from "@/hooks/useDatos";
import { sendJson, mensajeDeError } from "@/lib/http";
import { perfilPostulanteRespuestaSchema, type PerfilPostulante } from "@/lib/validation/postulante-perfil";
import type { z } from "zod";

type RespuestaGet = z.infer<typeof perfilPostulanteRespuestaSchema>;

export function usePerfilPostulante() {
  const {
    datos,
    loading,
    error,
    sinAcceso,
    recargar,
  } = useDatos<RespuestaGet>("/api/postulante/perfil", perfilPostulanteRespuestaSchema);

  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);

  const perfil = datos && datos.nombre ? datos : null;

  async function guardar(perfilData: PerfilPostulante): Promise<boolean> {
    setGuardando(true);
    setErrorGuardado(null);

    try {
      await sendJson("/api/postulante/perfil", {
        method: "PUT",
        body: perfilData,
      });
      await recargar();
      return true;
    } catch (e: unknown) {
      setErrorGuardado(mensajeDeError(e));
      return false;
    } finally {
      setGuardando(false);
    }
  }

  return {
    perfil,
    loading,
    error,
    sinAcceso,
    recargar,
    guardar,
    guardando,
    errorGuardado,
  };
}
