import { INICIO_POR_ROL } from "@/lib/rutas";
import { ingresoSchema } from "@/lib/validation/auth";
import { bloquearEnProduccion } from "@/mocks/respuestas";
import { USUARIOS_DE_PRUEBA, iniciarSesion } from "@/mocks/sesion";

/**
 * POST /api/auth/ingreso (D-020): logs in and answers where to go.
 *
 * TEMPORARY (DT-003, D-028): only the three test users of src/mocks/sesion.ts
 * exist, with any password. The real version signs in with Supabase Auth and
 * reads the role from `profiles`. The error is the same for an unknown email
 * and a wrong password, so nobody can check which accounts exist (AGENTS §7).
 */
export async function POST(request: Request) {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;

  const datos = ingresoSchema.safeParse(await request.json().catch(() => null));
  if (!datos.success) {
    return Response.json({ error: datos.error.issues[0].message }, { status: 400 });
  }

  const email = datos.data.email.toLowerCase();
  const rol = USUARIOS_DE_PRUEBA[email];
  if (!rol) {
    return Response.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
  }

  await iniciarSesion({ rol, email });
  return Response.json({ destino: INICIO_POR_ROL[rol] });
}
