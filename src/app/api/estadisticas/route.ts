import { responder } from "@/lib/respuestas-api";
import { verEstadisticasPublicas } from "@/lib/use-cases/inicio";

/**
 * GET /api/estadisticas (P01, D-059): the portal's public totals for the home
 * page. Public: works with or without a session, and carries no personal data.
 */
export async function GET() {
  return responder(await verEstadisticasPublicas());
}
