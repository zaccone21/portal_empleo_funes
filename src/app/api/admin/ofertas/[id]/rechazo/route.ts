import { rechazoSchema } from "@/lib/validation/oficina";
import { almacen } from "@/mocks/almacen";
import { aOfertaOficina } from "@/mocks/dto";
import { bloquearEnProduccion } from "@/mocks/respuestas";
import { exigirRol } from "@/mocks/sesion";

/**
 * POST /api/admin/ofertas/[id]/rechazo `{ motivo }`: the Office rejects a
 * pending offer (RF1.5.3, D-030). The reason is required: the company reads
 * it in "Mis ofertas" (RF1.3.5).
 * 400 without a reason; 404 if it does not exist; 409 if it is not pending;
 * 200 `{ oferta }`.
 *
 * TEMPORARY (DT-003): changes the simulated store.
 */
export async function POST(request: Request, ctx: RouteContext<"/api/admin/ofertas/[id]/rechazo">) {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;
  const usuario = await exigirRol("admin");
  if (usuario instanceof Response) return usuario;

  const datos = rechazoSchema.safeParse(await request.json().catch(() => null));
  if (!datos.success) {
    return Response.json({ error: datos.error.issues[0].message }, { status: 400 });
  }

  const { id } = await ctx.params;
  const oferta = almacen.ofertas.find((o) => o.id === id);
  if (!oferta) {
    return Response.json({ error: "No encontramos esa oferta." }, { status: 404 });
  }
  if (oferta.estado !== "pending") {
    return Response.json({ error: "Esta oferta ya fue revisada." }, { status: 409 });
  }

  oferta.estado = "rejected";
  oferta.motivoRechazo = datos.data.motivo;
  return Response.json({ oferta: aOfertaOficina(oferta) });
}
