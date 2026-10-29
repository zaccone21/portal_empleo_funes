import { datosInvalidos, leerCuerpo, responder } from "@/lib/respuestas-api";
import { reenviarCorreoConfirmacion } from "@/lib/use-cases/acceso";
import { reenviarConfirmacionSchema } from "@/lib/validation/auth";

/**
 * POST /api/auth/reenviar-confirmacion: resends the signup confirmation email
 * with a fresh activation link. Answers 204 whether the email has an account
 * or not (AGENTS §7).
 */
export async function POST(request: Request) {
  const datos = reenviarConfirmacionSchema.safeParse(await leerCuerpo(request));
  if (!datos.success) return datosInvalidos(datos.error);

  const url = new URL(request.url);
  const volver = url.searchParams.get("volver");
  const urlConfirmacion = volver
    ? `${url.origin}/acceso/confirmar?volver=${encodeURIComponent(volver)}`
    : `${url.origin}/acceso/confirmar`;
  return responder(await reenviarCorreoConfirmacion(datos.data, urlConfirmacion), 204);
}
