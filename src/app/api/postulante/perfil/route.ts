import { getCurrentUser } from "@/lib/dal/auth";
import { datosInvalidos, leerCuerpo, responder, sinSesion } from "@/lib/respuestas-api";
import { actualizarPerfilPostulante, obtenerPerfilPostulante } from "@/lib/use-cases/postulante";
import { perfilPostulanteSchema } from "@/lib/validation/postulante-perfil";

/** GET /api/postulante/perfil (P03): The applicant data and trades, null if never filled. */
export async function GET() {
  const usuario = await getCurrentUser();
  if (!usuario) return sinSesion();

  return responder(await obtenerPerfilPostulante(usuario));
}

/**
 * PUT /api/postulante/perfil (P03): saves the applicant data, validated with
 * the schema. 409 if another account already has that DNI.
 */
export async function PUT(request: Request) {
  const usuario = await getCurrentUser();
  if (!usuario) return sinSesion();

  const datos = perfilPostulanteSchema.safeParse(await leerCuerpo(request));
  if (!datos.success) return datosInvalidos(datos.error);

  return responder(await actualizarPerfilPostulante(usuario, datos.data));
}
