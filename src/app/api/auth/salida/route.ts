import { bloquearEnProduccion } from "@/mocks/respuestas";
import { cerrarSesion } from "@/mocks/sesion";

/**
 * POST /api/auth/salida (D-028): logs out. Always 204, even without a
 * session: the result for the person is the same.
 *
 * TEMPORARY (DT-003): deletes the simulated session cookie. The real version
 * calls Supabase Auth's signOut.
 */
export async function POST() {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;

  await cerrarSesion();
  return new Response(null, { status: 204 });
}
