import { cambioEstadoPostulacionSchema } from "@/lib/validation/oficina";
import { almacen } from "@/mocks/almacen";
import { aPostulacionOficina } from "@/mocks/dto";
import { bloquearEnProduccion } from "@/mocks/respuestas";
import { exigirRol } from "@/mocks/sesion";

/**
 * PATCH /api/admin/postulaciones/[id] `{ estado }`: the Office sets an
 * application's status: Postulado, Pre-seleccionado, Derivado or No apto
 * (RF1.5.6, D-030). The applicant never sees it (RF1.2.4).
 * 400 with an unknown status; 404 if it does not exist; 200 `{ postulacion }`.
 *
 * TEMPORARY (DT-003): changes the simulated store.
 */
export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/postulaciones/[id]">) {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;
  const usuario = await exigirRol("admin");
  if (usuario instanceof Response) return usuario;

  const datos = cambioEstadoPostulacionSchema.safeParse(await request.json().catch(() => null));
  if (!datos.success) {
    return Response.json({ error: datos.error.issues[0].message }, { status: 400 });
  }

  const { id } = await ctx.params;
  const postulacion = almacen.postulaciones.find((p) => p.id === id);
  if (!postulacion) {
    return Response.json({ error: "No encontramos esa postulación." }, { status: 404 });
  }

  postulacion.estado = datos.data.estado;
  return Response.json({ postulacion: aPostulacionOficina(postulacion) });
}
