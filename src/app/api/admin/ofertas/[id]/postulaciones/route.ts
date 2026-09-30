import { getCurrentUser } from "@/lib/dal/auth";
import { esIdValido, noEncontrado, responder, sinSesion } from "@/lib/respuestas-api";
import { verPostulantes } from "@/lib/use-cases/oficina";

/** GET /api/admin/ofertas/[id]/postulaciones (RF1.5.5, D-030): who applied, in arrival order, with status and CV. */
export async function GET(_request: Request, ctx: RouteContext<"/api/admin/ofertas/[id]/postulaciones">) {
  const usuario = await getCurrentUser();
  if (!usuario) return sinSesion();

  const { id } = await ctx.params;
  if (!esIdValido(id)) return noEncontrado("No encontramos esa oferta.");

  return responder(await verPostulantes(usuario, id));
}
