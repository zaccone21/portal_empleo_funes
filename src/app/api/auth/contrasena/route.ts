import { datosInvalidos, leerCuerpo, responder } from "@/lib/respuestas-api";
import { elegirNuevaContrasena } from "@/lib/use-cases/acceso";
import { nuevaContrasenaSchema } from "@/lib/validation/auth";

/**
 * PATCH /api/auth/contrasena (D-020): sets a new password for the session
 * opened by the recovery link. 200 `{ destino }`; 401 if the link expired.
 */
export async function PATCH(request: Request) {
  const datos = nuevaContrasenaSchema.safeParse(await leerCuerpo(request));
  if (!datos.success) return datosInvalidos(datos.error);

  return responder(await elegirNuevaContrasena(datos.data));
}
