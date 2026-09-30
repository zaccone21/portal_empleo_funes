import { getCurrentUser } from "@/lib/dal/auth";
import { responder, sinSesion } from "@/lib/respuestas-api";
import { verOfertas } from "@/lib/use-cases/oficina";

/** GET /api/admin/ofertas (D-030): every offer with its company and application count, newest first. */
export async function GET() {
  const usuario = await getCurrentUser();
  if (!usuario) return sinSesion();

  return responder(await verOfertas(usuario));
}
