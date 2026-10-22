import { responder } from "@/lib/respuestas-api";
import { verEstadisticasPublicas } from "@/lib/use-cases/inicio";

/**
 * GET /api/estadisticas (P01, D-059): the portal's public totals for the home
 * page. Public: works with or without a session, and carries no personal data.
 *
 * The home page asks again every minute (D-066), so the CDN may keep the same
 * answer for 60 seconds: however many visitors there are, the database counts
 * at most about once a minute.
 */
export async function GET() {
  const resultado = await verEstadisticasPublicas();
  if (!resultado.ok) return responder(resultado);

  return Response.json(resultado.datos, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60" },
  });
}
