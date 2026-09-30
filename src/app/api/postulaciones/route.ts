import { getCurrentUser } from "@/lib/dal/auth";
import { datosInvalidos, leerCuerpo, responder, sinSesion } from "@/lib/respuestas-api";
import { postularme, verMisPostulaciones } from "@/lib/use-cases/postulante";
import { postularseSchema } from "@/lib/validation/postulaciones";

/** GET /api/postulaciones (D-024): the applicant's own applications, newest first, without status (RF1.2.4). */
export async function GET() {
  const usuario = await getCurrentUser();
  if (!usuario) return sinSesion();

  return responder(await verMisPostulaciones(usuario));
}

/**
 * POST /api/postulaciones (D-024): applies to an offer. 201 (also if already
 * applied); 404 if the offer is not published; 409 without a CV (RF1.4.4).
 */
export async function POST(request: Request) {
  const usuario = await getCurrentUser();
  if (!usuario) return sinSesion();

  const datos = postularseSchema.safeParse(await leerCuerpo(request));
  if (!datos.success) return datosInvalidos(datos.error);

  return responder(await postularme(usuario, datos.data.ofertaId), 201);
}
