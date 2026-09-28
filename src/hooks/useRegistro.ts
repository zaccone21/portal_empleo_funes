import { useState } from "react";

import { mensajeDeError, sendJson } from "@/lib/http";
import type { DatosRegistro } from "@/lib/validation/auth";

/**
 * Creates an applicant or company account (P02, P08) through POST /api/auth/registro.
 *
 * Contract (D-020): 201 with no body; 400 invalid data. The server also
 * answers 201 when the email is already registered, so the screen never
 * reveals which emails have an account (AGENTS §7). With email confirmation
 * on (D-020), the account cannot be used until the user opens the link that
 * Supabase sends, so after a success the screen says "Revisá tu correo".
 *
 * `registrar` resolves to true on success. On failure it resolves to false and
 * the message is left in `error` (D-013).
 */
export function useRegistro() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function registrar(datos: DatosRegistro): Promise<boolean> {
    setLoading(true);
    setError(null);
    try {
      await sendJson("/api/auth/registro", { body: datos });
      return true;
    } catch (e) {
      setError(mensajeDeError(e));
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { registrar, loading, error };
}
