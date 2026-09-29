import { useContext } from "react";

import { ContextoSesion, type EstadoSesion } from "@/components/sesion/ProveedorSesion";

/**
 * Who is logged in, as ProveedorSesion read it from GET /api/auth/sesion
 * (D-028): `usuario` is the user, null for nobody, or undefined while loading.
 * Only for what the screen shows (menus, notices); permissions are always
 * checked by the server.
 */
export function useSesion(): EstadoSesion {
  const sesion = useContext(ContextoSesion);
  if (!sesion) {
    throw new Error("useSesion needs a ProveedorSesion above it (see the area layouts).");
  }
  return sesion;
}
