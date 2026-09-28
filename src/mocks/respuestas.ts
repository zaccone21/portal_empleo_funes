/*
 * TEMPORARY (DT-003): guard for the simulated API routes.
 */

/**
 * In production the simulated routes answer 404, so fake data can never
 * reach real users (D-009). Returns the response to send, or undefined when
 * the route may go on (development and tests).
 */
export function bloquearEnProduccion(): Response | undefined {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "No disponible." }, { status: 404 });
  }
  return undefined;
}
