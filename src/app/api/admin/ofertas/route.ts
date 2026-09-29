import { almacen } from "@/mocks/almacen";
import { aOfertaOficina } from "@/mocks/dto";
import { bloquearEnProduccion } from "@/mocks/respuestas";
import { exigirRol } from "@/mocks/sesion";

/**
 * GET /api/admin/ofertas: every offer in every status, for the Office (P15,
 * RF1.5.2, D-030), newest first. The screen splits them by status.
 *
 * TEMPORARY (DT-003): read from the simulated store.
 */
export async function GET() {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;
  const usuario = await exigirRol("admin");
  if (usuario instanceof Response) return usuario;

  const todas = [...almacen.ofertas].sort((a, b) => b.creadaEl.localeCompare(a.creadaEl));
  return Response.json(todas.map(aOfertaOficina));
}
