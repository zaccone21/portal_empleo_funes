import { useState } from "react";

import { mensajeDeError, sendJson } from "@/lib/http";
import { respuestaConDestinoSchema, type DatosNuevaContrasena } from "@/lib/validation/auth";

/**
 * Sets a new password (after the recovery email) through PATCH /api/auth/contrasena.
 * The user arrives here with the session that the email link opened, so the
 * body only carries the password; the server knows whose it is.
 *
 * Contract (D-020): 200 `{ destino }`; 400 invalid data; 401 when there is no
 * session (the link expired or was already used).
 *
 * `cambiarContrasena` resolves to the destination on success, or `undefined`
 * with the message in `error` on failure (D-013). As in useIngreso, `loading`
 * stays true after a success because the page navigates away.
 */
export function useNuevaContrasena() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cambiarContrasena(datos: DatosNuevaContrasena): Promise<string | undefined> {
    setLoading(true);
    setError(null);
    try {
      const { destino } = await sendJson("/api/auth/contrasena", {
        method: "PATCH",
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

  return { cambiarContrasena, loading, error };
}
