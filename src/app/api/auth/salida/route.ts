import { responder } from "@/lib/respuestas-api";
import { cerrarSesion } from "@/lib/use-cases/acceso";

/** POST /api/auth/salida (D-028): logs out. Always 204, even without a session. */
export async function POST() {
  return responder(await cerrarSesion(), 204);
}
