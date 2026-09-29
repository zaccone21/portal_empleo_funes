import { registroSchema } from "@/lib/validation/auth";
import { bloquearEnProduccion } from "@/mocks/respuestas";

/**
 * POST /api/auth/registro (D-020): creates an applicant or company account.
 *
 * TEMPORARY (DT-003, D-028): validates and answers 201 without creating
 * anything (only the test users can log in). The real version signs up with
 * Supabase Auth, which sends the confirmation email; it also answers 201 when
 * the email already exists, so nobody can check which accounts exist.
 */
export async function POST(request: Request) {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;

  const datos = registroSchema.safeParse(await request.json().catch(() => null));
  if (!datos.success) {
    return Response.json({ error: datos.error.issues[0].message }, { status: 400 });
  }

  return new Response(null, { status: 201 });
}
