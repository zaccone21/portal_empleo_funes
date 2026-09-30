import { getCurrentUser } from "@/lib/dal/auth";
import { responder } from "@/lib/respuestas-api";
import { verOfertasPublicadas } from "@/lib/use-cases/postulante";

/**
 * GET /api/ofertas (D-024, D-028): published offers, newest first. Public:
 * works with or without a session. `yaTePostulaste` marks the ones the
 * logged-in applicant already applied to. Search, filter and order happen on
 * the screen (D-029).
 */
export async function GET() {
  return responder(await verOfertasPublicadas(await getCurrentUser()));
}
