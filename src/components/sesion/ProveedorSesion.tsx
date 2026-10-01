"use client";

import { createContext, useEffect, useState, type ReactNode } from "react";

import { getJson, mensajeDeError } from "@/lib/http";
import { respuestaSesionSchema, type UsuarioSesion } from "@/lib/validation/auth";

export type EstadoSesion = {
  /** Who is logged in; null for nobody; undefined while it is being asked. */
  usuario: UsuarioSesion | null | undefined;
  /** Why the session could not be read, if it failed. */
  error: string | null;
};

export const ContextoSesion = createContext<EstadoSesion | null>(null);

/**
 * Asks GET /api/auth/sesion once (D-028) and shares the answer with every
 * component of the area (the top bar, the bottom bar, notices that depend on
 * the role). It lives in the layout of each area, so moving between screens
 * of the same area does not ask again, and crossing to another area (for
 * example after logging in or out) asks fresh.
 *
 * If the question fails, `error` is set and the menus fall back to the
 * logged-out version (they offer "Ingresar"). Each screen that needs a
 * session still asks the server for its own data and reports its own errors,
 * so a failure here never grants or hides access.
 */
export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoSesion>({ usuario: undefined, error: null });

  useEffect(() => {
    let vigente = true;

    getJson("/api/auth/sesion", respuestaSesionSchema)
      .then((respuesta) => {
        if (vigente) setEstado({ usuario: respuesta.usuario, error: null });
      })
      .catch((e: unknown) => {
        if (vigente) setEstado({ usuario: null, error: mensajeDeError(e) });
      });

    return () => {
      vigente = false;
    };
  }, []);

  return <ContextoSesion.Provider value={estado}>{children}</ContextoSesion.Provider>;
}
