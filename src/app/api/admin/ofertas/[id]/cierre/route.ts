import { getCurrentUser } from "@/lib/dal/auth";
import { esIdValido, noEncontrado, responder, sinSesion } from "@/lib/respuestas-api";
import { cerrarOferta } from "@/lib/use-cases/oficina";

/** POST /api/admin/ofertas/[id]/cierre (RF1.5.4, D-030): closes a published offer whose company asked for it. */
export async function POST(_request: Request, ctx: RouteContext<"/api/admin/ofertas/[id]/cierre">) {
  const usuario = await getCurrentUser();
  if (!usuario) return sinSesion();

  const { id } = await ctx.params;
  if (!esIdValido(id)) return noEncontrado("No encontramos esa oferta.");

  return responder(await cerrarOferta(usuario, id));
}
