import { useState } from "react";

import { mensajeDeError, sendJson } from "@/lib/http";
import type { DatosRecuperarContrasena } from "@/lib/validation/auth";

/**
 * Asks for a password recovery email (P02, P08) through
 * POST /api/auth/recuperar-contrasena.
 *
 * Contract (D-020): 204 always, whether the email exists or not, so the
 * screen cannot be used to find out who has an account (AGENTS §7); 400
 * invalid data. The email link opens a session and takes the user to
 * /nueva-contrasena.
 *
 * `pedirEnlace` resolves to true on success. On failure it resolves to false
 * and the message is left in `error` (D-013).
 */
export function useRecuperarContrasena() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pedirEnlace(datos: DatosRecuperarContrasena): Promise<boolean> {
    setLoading(true);
    setError(null);
    try {
      await sendJson("/api/auth/recuperar-contrasena", { body: datos });
      return true;
    } catch (e) {
      setError(mensajeDeError(e));
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { pedirEnlace, loading, error };
}
