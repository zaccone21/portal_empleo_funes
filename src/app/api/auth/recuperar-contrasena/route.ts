import { recuperarContrasenaSchema } from "@/lib/validation/auth";
import { bloquearEnProduccion } from "@/mocks/respuestas";

/**
 * POST /api/auth/recuperar-contrasena (D-020): asks for the recovery email.
 *
 * TEMPORARY (DT-003, D-028): validates and answers 204 without sending
 * anything. The real version asks Supabase Auth to send the email, and also
 * answers 204 for unknown emails (AGENTS §7).
 */
export async function POST(request: Request) {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;

  const datos = recuperarContrasenaSchema.safeParse(await request.json().catch(() => null));
  if (!datos.success) {
    return Response.json({ error: datos.error.issues[0].message }, { status: 400 });
  }

  return new Response(null, { status: 204 });
}
