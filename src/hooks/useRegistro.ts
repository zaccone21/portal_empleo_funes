import { useState } from "react";

import { mensajeDeError, sendJson } from "@/lib/http";
import { respuestaRegistroSchema, type DatosRegistro } from "@/lib/validation/auth";

/**
 * Creates an applicant or company account (P02, P08) through POST /api/auth/registro.
 *
 * Contract (D-020, D-034): 201 `{ destino }`; 400 invalid data; 503 when the
 * email could not be sent. The server also answers 201 when the email is
 * already registered, so the screen never reveals which emails have an
 * account (AGENTS §7).
 * - `destino: null`: email confirmation is on, the account works after
 *   opening the link Supabase sends ("Revisá tu correo").
 * - `destino: "/…"`: Supabase logged the person in right away; the screen
 *   goes there.
 *
 * `registrar` resolves to `{ destino }` on success. On failure it resolves to
 * null and the message is left in `error` (D-013).
 */
export function useRegistro() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function registrar(datos: DatosRegistro): Promise<{ destino: string | null } | null> {
    setLoading(true);
    setError(null);
    try {
      return await sendJson("/api/auth/registro", { body: datos, responseSchema: respuestaRegistroSchema });
    } catch (e) {
      setError(mensajeDeError(e));
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { registrar, loading, error };
}
