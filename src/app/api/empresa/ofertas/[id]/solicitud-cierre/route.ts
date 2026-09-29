import { almacen } from "@/mocks/almacen";
import { aOfertaEmpresa } from "@/mocks/dto";
import { bloquearEnProduccion } from "@/mocks/respuestas";
import { exigirRol } from "@/mocks/sesion";

/**
 * POST /api/empresa/ofertas/[id]/solicitud-cierre: the company asks the
 * Office to close one of its offers (RF1.3.6, D-027). It is a flag, not a
 * status: the offer stays published until the Office closes it (D-008).
 *
 * Rules (the real use case will have the same ones):
 * 1. 404 if the offer does not exist or belongs to another company (the
 *    answer is the same, so nobody learns about other companies' offers).
 * 2. 409 if it is not published (only a published offer can be closed).
 * 3. 200 `{ oferta }`, also when the close was already requested (idempotent).
 *
 * TEMPORARY (DT-003): works on the simulated store.
 */
export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/empresa/ofertas/[id]/solicitud-cierre">,
) {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;
  const usuario = await exigirRol("company");
  if (usuario instanceof Response) return usuario;

  const { id } = await ctx.params;
  const oferta = almacen.ofertas.find((o) => o.id === id && o.emailEmpresa === usuario.email);
  if (!oferta) {
    return Response.json({ error: "No encontramos esa oferta." }, { status: 404 });
  }
  if (oferta.estado !== "published") {
    return Response.json(
      { error: "Solo se puede pedir el cierre de una oferta publicada." },
      { status: 409 },
    );
  }

  oferta.cierreSolicitado = true;
  return Response.json({ oferta: aOfertaEmpresa(oferta) });
}
