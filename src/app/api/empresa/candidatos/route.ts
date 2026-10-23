import { getCurrentUser } from "@/lib/dal/auth";
import { esIdValido, noEncontrado, responder, sinSesion } from "@/lib/respuestas-api";
import { verCandidatosDerivados } from "@/lib/use-cases/empresa";

/**
 * GET /api/empresa/candidatos (P09, P17; RF1.6.3, D-044): the applicants the
 * Office referred to the company's offers, the oldest referral first. With
 * `?oferta=<id>`, only those of that offer (404 if it is not the company's).
 */
export async function GET(request: Request) {
  const usuario = await getCurrentUser();
  if (!usuario) return sinSesion();

  const ofertaId = new URL(request.url).searchParams.get("oferta") ?? undefined;
  if (ofertaId !== undefined && !esIdValido(ofertaId)) return noEncontrado("No encontramos esa oferta.");

  return responder(await verCandidatosDerivados(usuario, ofertaId));
}
