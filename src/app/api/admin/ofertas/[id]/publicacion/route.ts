import { almacen } from "@/mocks/almacen";
import { aOfertaOficina } from "@/mocks/dto";
import { bloquearEnProduccion } from "@/mocks/respuestas";
import { exigirRol } from "@/mocks/sesion";

/**
 * POST /api/admin/ofertas/[id]/publicacion: the Office publishes a pending
 * offer (RF1.5.3, D-030). From then on it shows in the public catalog.
 * 404 if it does not exist; 409 if it is not pending (someone else already
 * decided); 200 `{ oferta }`.
 *
 * TEMPORARY (DT-003): changes the simulated store.
 */
export async function POST(_request: Request, ctx: RouteContext<"/api/admin/ofertas/[id]/publicacion">) {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;
  const usuario = await exigirRol("admin");
  if (usuario instanceof Response) return usuario;

  const { id } = await ctx.params;
  const oferta = almacen.ofertas.find((o) => o.id === id);
  if (!oferta) {
    return Response.json({ error: "No encontramos esa oferta." }, { status: 404 });
  }
  if (oferta.estado !== "pending") {
    return Response.json({ error: "Esta oferta ya fue revisada." }, { status: 409 });
  }

  oferta.estado = "published";
  oferta.publicadaEl = new Date().toISOString();
  return Response.json({ oferta: aOfertaOficina(oferta) });
}
