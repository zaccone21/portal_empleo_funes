import { getCurrentUser } from "@/lib/dal/auth";
import { datosInvalidos, esIdValido, leerCuerpo, noEncontrado, responder, sinSesion } from "@/lib/respuestas-api";
import { cambiarEstadoPostulacion } from "@/lib/use-cases/oficina";
import { cambioEstadoPostulacionSchema } from "@/lib/validation/oficina";

/** PATCH /api/admin/postulaciones/[id] (RF1.5.6, D-030): changes an application's status. */
export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/postulaciones/[id]">) {
  const usuario = await getCurrentUser();
  if (!usuario) return sinSesion();

  const datos = cambioEstadoPostulacionSchema.safeParse(await leerCuerpo(request));
  if (!datos.success) return datosInvalidos(datos.error);

  const { id } = await ctx.params;
  if (!esIdValido(id)) return noEncontrado("No encontramos esa postulación.");

  return responder(await cambiarEstadoPostulacion(usuario, id, datos.data.estado));
}
