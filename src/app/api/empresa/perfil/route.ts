import { getCurrentUser } from "@/lib/dal/auth";
import { datosInvalidos, leerCuerpo, responder, sinSesion } from "@/lib/respuestas-api";
import { guardarPerfil, verPerfilEmpresa } from "@/lib/use-cases/empresa";
import { perfilEmpresaSchema } from "@/lib/validation/empresa";

/** GET /api/empresa/perfil (D-027): `{ perfil }`, null until the company fills it in. */
export async function GET() {
  const usuario = await getCurrentUser();
  if (!usuario) return sinSesion();

  return responder(await verPerfilEmpresa(usuario));
}

/**
 * PUT /api/empresa/perfil (D-027): saves the company data, validated again with
 * the form's schema (AGENTS §7). Answers what was saved, with the CUIT
 * normalized. 409 if another account already has that CUIT.
 */
export async function PUT(request: Request) {
  const usuario = await getCurrentUser();
  if (!usuario) return sinSesion();

  const datos = perfilEmpresaSchema.safeParse(await leerCuerpo(request));
  if (!datos.success) return datosInvalidos(datos.error);

  return responder(await guardarPerfil(usuario, datos.data));
}
