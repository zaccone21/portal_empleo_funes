import { useState } from "react";

import { mensajeDeError, sendJson } from "@/lib/http";

/**
 * Logs out through POST /api/auth/salida (D-028).
 *
 * `salir` resolves to true when it worked; the caller then leaves the private
 * screens. On failure it resolves to false and the message is in `error`
 * (D-013). `loading` stays true after a success because the page navigates
 * away.
 */
export function useSalir() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function salir(): Promise<boolean> {
    setLoading(true);
    setError(null);
    try {
      await sendJson("/api/auth/salida", {});
      return true;
    } catch (e) {
      setError(mensajeDeError(e));
      setLoading(false);
      return false;
    }
  }

  return { salir, loading, error };
}
