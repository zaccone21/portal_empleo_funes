import { bloquearEnProduccion } from "@/mocks/respuestas";
import { leerSesion } from "@/mocks/sesion";

/**
 * GET /api/auth/sesion (D-028): who is logged in, `{ usuario: { rol, email } }`,
 * or `{ usuario: null }`. Nobody logged in is a normal answer (200), because
 * public screens ask too, to show "Ingresar" or the person's menu.
 *
 * TEMPORARY (DT-003): reads the simulated session. The real version uses
 * getCurrentUser() and the role from `profiles`.
 */
export async function GET() {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;

  return Response.json({ usuario: await leerSesion() });
}
