import { getCurrentUser } from "@/lib/dal/auth";
import { datosInvalidos, esIdValido, leerCuerpo, noEncontrado, responder, sinSesion } from "@/lib/respuestas-api";
import { rechazarOferta } from "@/lib/use-cases/oficina";
import { rechazoSchema } from "@/lib/validation/oficina";

/** POST /api/admin/ofertas/[id]/rechazo (RF1.5.3, D-030): rejects a pending offer; the reason is required. */
export async function POST(request: Request, ctx: RouteContext<"/api/admin/ofertas/[id]/rechazo">) {
  const usuario = await getCurrentUser();
  if (!usuario) return sinSesion();

  const datos = rechazoSchema.safeParse(await leerCuerpo(request));
  if (!datos.success) return datosInvalidos(datos.error);

  const { id } = await ctx.params;
  if (!esIdValido(id)) return noEncontrado("No encontramos esa oferta.");

  return responder(await rechazarOferta(usuario, id, datos.data.motivo));
}
