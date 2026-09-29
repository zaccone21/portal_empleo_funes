import { perfilEmpresaSchema } from "@/lib/validation/empresa";
import { almacen } from "@/mocks/almacen";
import { bloquearEnProduccion } from "@/mocks/respuestas";
import { exigirRol } from "@/mocks/sesion";

/*
 * /api/empresa/perfil: the logged-in company's data (P10, RF1.3.2, D-027).
 *
 * TEMPORARY (DT-003): uses the simulated store with the simulated session
 * (D-028). With the real backend: getCurrentUser() (401 without session) →
 * use case (403 if the role is not company) → DAL.
 */

/** GET: `{ perfil }`, null until the company fills it in. */
export async function GET() {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;
  const usuario = await exigirRol("company");
  if (usuario instanceof Response) return usuario;

  return Response.json({ perfil: almacen.empresas[usuario.email] ?? null });
}

/**
 * PUT: saves the company data. The server validates again with the same
 * schema as the form (AGENTS §7) and answers with what it saved, so the
 * screen shows the normalized CUIT.
 */
export async function PUT(request: Request) {
  const bloqueo = bloquearEnProduccion();
  if (bloqueo) return bloqueo;
  const usuario = await exigirRol("company");
  if (usuario instanceof Response) return usuario;

  const datos = perfilEmpresaSchema.safeParse(await request.json().catch(() => null));
  if (!datos.success) {
    return Response.json({ error: datos.error.issues[0].message }, { status: 400 });
  }

  almacen.empresas[usuario.email] = datos.data;
  return Response.json({ perfil: datos.data });
}
