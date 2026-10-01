import { getCurrentUser } from "@/lib/dal/auth";
import { esIdValido, noEncontrado, responder, sinSesion } from "@/lib/respuestas-api";
import { publicarOfertaPendiente } from "@/lib/use-cases/oficina";

/** POST /api/admin/ofertas/[id]/publicacion (RF1.5.3, D-030): publishes a pending offer. 409 if it was already decided. */
export async function POST(_request: Request, ctx: RouteContext<"/api/admin/ofertas/[id]/publicacion">) {
  const usuario = await getCurrentUser();
  if (!usuario) return sinSesion();

  const { id } = await ctx.params;
  if (!esIdValido(id)) return noEncontrado("No encontramos esa oferta.");

  return responder(await publicarOfertaPendiente(usuario, id));
}
