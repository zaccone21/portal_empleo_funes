import { getCurrentUser } from "@/lib/dal/auth";
import { esIdValido, noEncontrado, responder, sinSesion } from "@/lib/respuestas-api";
import { pedirCierre } from "@/lib/use-cases/empresa";

/**
 * POST /api/empresa/ofertas/[id]/solicitud-cierre (RF1.3.6, D-027): the
 * company asks the Office to close its published offer. 200 `{ oferta }`
 * (also if already asked); 404 if it does not exist or is another company's;
 * 409 if it is not published.
 */
export async function POST(_request: Request, ctx: RouteContext<"/api/empresa/ofertas/[id]/solicitud-cierre">) {
  const usuario = await getCurrentUser();
  if (!usuario) return sinSesion();

  const { id } = await ctx.params;
  if (!esIdValido(id)) return noEncontrado("No encontramos esa oferta.");

  return responder(await pedirCierre(usuario, id));
}
