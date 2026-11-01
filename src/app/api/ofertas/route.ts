import { NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/dal/auth";
import { responder } from "@/lib/respuestas-api";
import { verOfertasPublicadas, verOfertasPublicadasPaginadas } from "@/lib/use-cases/postulante";

/**
 * GET /api/ofertas (D-024, D-028): published offers, newest first. Public:
 * works with or without a session. `yaTePostulaste` marks the ones the
 * logged-in applicant already applied to.
 * When `pagina` is provided, paginates directly on Supabase backend range.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const usuario = await getCurrentUser();

  if (searchParams.has("pagina")) {
    const pagina = Number(searchParams.get("pagina")) || 1;
    const porPagina = Number(searchParams.get("porPagina") || searchParams.get("limite")) || 20;
    const rubro = searchParams.get("rubro") || undefined;
    const q = searchParams.get("q") || undefined;

    return responder(
      await verOfertasPublicadasPaginadas(usuario, { pagina, porPagina }, { rubro, q })
    );
  }

  return responder(await verOfertasPublicadas(usuario));
}
