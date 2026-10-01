import { getCurrentUser } from "@/lib/dal/auth";
import { responder, sinSesion } from "@/lib/respuestas-api";
import { verResumen } from "@/lib/use-cases/oficina";

/** GET /api/admin/resumen (D-030): the panel's numbers (P14). PROVISIONAL until Q-012. */
export async function GET() {
  const usuario = await getCurrentUser();
  if (!usuario) return sinSesion();

  return responder(await verResumen(usuario));
}
