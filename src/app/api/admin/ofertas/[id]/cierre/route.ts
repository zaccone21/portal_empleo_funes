import { almacen } from "@/mocks/almacen";
import { aOfertaOficina } from "@/mocks/dto";
import { bloquearEnProduccion } from "@/mocks/respuestas";
import { exigirRol } from "@/mocks/sesion";

/**
 * POST /api/admin/ofertas/[id]/cierre: the Office closes an offer whose
 * company asked for it (RF1.5.4, D-030). It leaves the public catalog.
 * 404 if it does not exist; 409 if it is not published or nobody asked to
 * close it (RF1.5.4 only covers requested closes); 200 `{ oferta }`.
 *
 * TEMPORARY (DT-003): changes the simulated store.
 */
export async function POST(_request: Request, ctx: RouteContext<"/api/admin/ofertas/[id]/cierre">) {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;
  const usuario = await exigirRol("admin");
  if (usuario instanceof Response) return usuario;

  const { id } = await ctx.params;
  const oferta = almacen.ofertas.find((o) => o.id === id);
  if (!oferta) {
    return Response.json({ error: "No encontramos esa oferta." }, { status: 404 });
  }
  if (oferta.estado !== "published" || !oferta.cierreSolicitado) {
    return Response.json(
      { error: "Solo se cierran ofertas publicadas cuya empresa pidió el cierre." },
      { status: 409 },
    );
  }

  oferta.estado = "closed";
  return Response.json({ oferta: aOfertaOficina(oferta) });
}
