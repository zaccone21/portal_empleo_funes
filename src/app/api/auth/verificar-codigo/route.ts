import { datosInvalidos, leerCuerpo, responder } from "@/lib/respuestas-api";
import { confirmarConCodigo } from "@/lib/use-cases/acceso";
import { verificarCodigoEmailSchema } from "@/lib/validation/auth";

/**
 * POST /api/auth/verificar-codigo: verifies the 6-digit OTP code from the
 * signup confirmation email, sets the session cookies, and returns `{ destino }`.
 */
export async function POST(request: Request) {
  const datos = verificarCodigoEmailSchema.safeParse(await leerCuerpo(request));
  if (!datos.success) return datosInvalidos(datos.error);

  return responder(await confirmarConCodigo(datos.data));
}
