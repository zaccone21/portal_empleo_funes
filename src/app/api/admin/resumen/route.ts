import type { ResumenOficina } from "@/lib/validation/oficina";
import { almacen } from "@/mocks/almacen";
import { bloquearEnProduccion } from "@/mocks/respuestas";
import { exigirRol } from "@/mocks/sesion";

/**
 * GET /api/admin/resumen: the Office panel's indicators (P14, RF1.5.1, D-030).
 * PROVISIONAL (DT-006): only indicators that come straight from the offer and
 * application states; the final set is open (Q-012).
 *
 * TEMPORARY (DT-003): counted over the simulated store.
 */
export async function GET() {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;
  const usuario = await exigirRol("admin");
  if (usuario instanceof Response) return usuario;

  const resumen: ResumenOficina = {
    ofertasPendientes: almacen.ofertas.filter((o) => o.estado === "pending").length,
    pedidosDeCierre: almacen.ofertas.filter((o) => o.estado === "published" && o.cierreSolicitado).length,
    ofertasPublicadas: almacen.ofertas.filter((o) => o.estado === "published").length,
    postulacionesSinRevisar: almacen.postulaciones.filter((p) => p.estado === "applied").length,
  };
  return Response.json(resumen);
}
