import { datosInvalidos, leerCuerpo, responder } from "@/lib/respuestas-api";
import { ingresar } from "@/lib/use-cases/acceso";
import { ingresoSchema } from "@/lib/validation/auth";

/**
 * POST /api/auth/ingreso (D-020): logs in with Supabase Auth and answers
 * `{ destino }`, the home of the role stored in `perfiles`. 401 with the same
 * message for an unknown email and a wrong password (AGENTS §7).
 */
export async function POST(request: Request) {
  const datos = ingresoSchema.safeParse(await leerCuerpo(request));
  if (!datos.success) return datosInvalidos(datos.error);

  return responder(await ingresar(datos.data));
}
