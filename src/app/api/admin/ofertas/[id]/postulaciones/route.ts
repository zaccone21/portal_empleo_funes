import { almacen } from "@/mocks/almacen";
import { aPostulacionOficina } from "@/mocks/dto";
import { bloquearEnProduccion } from "@/mocks/respuestas";
import { exigirRol } from "@/mocks/sesion";

/**
 * GET /api/admin/ofertas/[id]/postulaciones: who applied to an offer, with
 * their CV and status (RF1.5.5, RF1.5.6, D-030), oldest first (the order they
 * arrived, which is the order the Office reviews them).
 * 404 if the offer does not exist.
 *
 * TEMPORARY (DT-003): read from the simulated store.
 */
export async function GET(_request: Request, ctx: RouteContext<"/api/admin/ofertas/[id]/postulaciones">) {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;
  const usuario = await exigirRol("admin");
  if (usuario instanceof Response) return usuario;

  const { id } = await ctx.params;
  if (!almacen.ofertas.some((o) => o.id === id)) {
    return Response.json({ error: "No encontramos esa oferta." }, { status: 404 });
  }

  const deLaOferta = almacen.postulaciones
    .filter((p) => p.ofertaId === id)
    .sort((a, b) => a.postuladoEl.localeCompare(b.postuladoEl));
  return Response.json(deLaOferta.map(aPostulacionOficina));
}
