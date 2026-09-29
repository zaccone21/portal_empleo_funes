import { INICIO_POR_ROL } from "@/lib/rutas";
import { nuevaContrasenaSchema } from "@/lib/validation/auth";
import { bloquearEnProduccion } from "@/mocks/respuestas";
import { leerSesion } from "@/mocks/sesion";

/**
 * PATCH /api/auth/contrasena (D-020): sets a new password for the session
 * opened by the recovery email.
 *
 * TEMPORARY (DT-003, D-028): with a simulated session it answers where to go
 * without changing anything; without a session, 401 (as when the email link
 * expired). The real version updates the password in Supabase Auth.
 */
export async function PATCH(request: Request) {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;

  const datos = nuevaContrasenaSchema.safeParse(await request.json().catch(() => null));
  if (!datos.success) {
    return Response.json({ error: datos.error.issues[0].message }, { status: 400 });
  }

  const usuario = await leerSesion();
  if (!usuario) {
    return Response.json(
      { error: "El enlace venció o ya se usó. Pedí uno nuevo desde \"Olvidé mi contraseña\"." },
      { status: 401 },
    );
  }

  return Response.json({ destino: INICIO_POR_ROL[usuario.rol] });
}
