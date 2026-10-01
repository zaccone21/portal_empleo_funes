import { useState } from "react";

import { mensajeDeError, sendJson } from "@/lib/http";
import { respuestaConDestinoSchema, type DatosIngreso } from "@/lib/validation/auth";

/**
 * Logs in with email and password (P02, P08, P13) through POST /api/auth/ingreso.
 *
 * Contract (D-020): 200 `{ destino }`; 400 invalid data; 401 "Email o
 * contraseña incorrectos" (generic on purpose, it never says whether the
 * account exists, AGENTS §7).
 *
 * `ingresar` resolves to the destination on success. On failure it resolves to
 * `undefined` and the message is left in `error` for the form to show (D-013).
 * `loading` stays true after a success because the page is about to navigate
 * away; turning it off would re-enable the button for a moment and allow a
 * second submit.
 */
export function useIngreso() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ingresar(datos: DatosIngreso): Promise<string | undefined> {
    setLoading(true);
    setError(null);
    try {
      const { destino } = await sendJson("/api/auth/ingreso", {
        body: datos,
        responseSchema: respuestaConDestinoSchema,
      });
      return destino;
    } catch (e) {
      setError(mensajeDeError(e));
      setLoading(false);
      return undefined;
    }
  }

  return { ingresar, loading, error };
}
