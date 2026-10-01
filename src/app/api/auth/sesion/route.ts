import { getCurrentUser } from "@/lib/dal/auth";
import { responder } from "@/lib/respuestas-api";
import { verSesion } from "@/lib/use-cases/acceso";

/**
 * GET /api/auth/sesion (D-028): `{ usuario: { rol, email } }` or
 * `{ usuario: null }`. Nobody logged in is a normal answer (200): public
 * screens ask too, to show "Ingresar" or the person's menu.
 */
export async function GET() {
  return responder(verSesion(await getCurrentUser()));
}
