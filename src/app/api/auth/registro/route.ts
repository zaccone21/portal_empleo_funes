import { datosInvalidos, leerCuerpo, responder } from "@/lib/respuestas-api";
import { registrarse } from "@/lib/use-cases/acceso";
import { registroSchema } from "@/lib/validation/auth";

/**
 * POST /api/auth/registro (D-020, D-034): creates an applicant or company
 * account. 201 `{ destino }`: null when the account is activated from the
 * email (Supabase sends it with a link to /acceso/confirmar), or the role's
 * home when Supabase logged the person in right away. Also 201 when the email
 * already exists, so nobody learns which accounts exist.
 */
export async function POST(request: Request) {
  try {
    const datos = registroSchema.safeParse(await leerCuerpo(request));
    if (!datos.success) return datosInvalidos(datos.error);

    const url = new URL(request.url);
    const volver = url.searchParams.get("volver");
    const urlConfirmacion = volver
      ? `${url.origin}/acceso/confirmar?volver=${encodeURIComponent(volver)}`
      : `${url.origin}/acceso/confirmar`;
    return responder(await registrarse(datos.data, urlConfirmacion), 201);
  } catch (error) {
    console.error("[POST /api/auth/registro error]:", error);
    return Response.json(
      { error: "No pudimos completar el registro en este momento. Probá de nuevo en unos minutos." },
      { status: 503 },
    );
  }
}
