import { OFERTAS_DE_EJEMPLO } from "@/mocks/datos-ejemplo";
import { bloquearEnProduccion } from "@/mocks/respuestas";

/**
 * GET /api/ofertas: published offers (D-024).
 *
 * TEMPORARY (DT-003, D-026): answers fake offers from src/mocks. When the
 * database exists, this becomes: call the use case that lists published
 * offers → DAL, and map the result to 200 / 500.
 */
export async function GET() {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;

  return Response.json(OFERTAS_DE_EJEMPLO);
}
