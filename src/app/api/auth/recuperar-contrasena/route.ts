import { datosInvalidos, leerCuerpo, responder } from "@/lib/respuestas-api";
import { pedirRecuperacion } from "@/lib/use-cases/acceso";
import { recuperarContrasenaSchema } from "@/lib/validation/auth";

/**
 * POST /api/auth/recuperar-contrasena (D-020): Supabase sends the recovery
 * email, whose link goes to /acceso/confirmar and then to /nueva-contrasena.
 * 204 whether the email has an account or not (AGENTS §7).
 */
export async function POST(request: Request) {
  const datos = recuperarContrasenaSchema.safeParse(await leerCuerpo(request));
  if (!datos.success) return datosInvalidos(datos.error);

  const urlConfirmacion = `${new URL(request.url).origin}/acceso/confirmar?tipo=recuperacion`;
  return responder(await pedirRecuperacion(datos.data, urlConfirmacion), 204);
}
