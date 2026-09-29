import { almacen } from "@/mocks/almacen";
import { aOfertaPublica } from "@/mocks/dto";
import { bloquearEnProduccion } from "@/mocks/respuestas";
import { leerSesion } from "@/mocks/sesion";

/**
 * GET /api/ofertas: published offers (D-024). Public: works with or without a
 * session. `yaTePostulaste` is true on the offers the logged-in applicant
 * already applied to (false for anyone else), so the list can say so without
 * a second request. Search, filter and order happen on the screen (D-029).
 *
 * TEMPORARY (DT-003, D-026): answers from the simulated store. With the real
 * backend: the use case that lists published offers → DAL, 200 / 500.
 */
export async function GET() {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;

  const usuario = await leerSesion();
  const postuladas = new Set(
    usuario?.rol === "applicant"
      ? almacen.postulaciones.filter((p) => p.emailPostulante === usuario.email).map((p) => p.ofertaId)
      : [],
  );

  return Response.json(
    almacen.ofertas
      .filter((oferta) => oferta.estado === "published")
      .map((oferta) => aOfertaPublica(oferta, postuladas.has(oferta.id))),
  );
}
