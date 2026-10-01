import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { TIPOS_DE_ENLACE } from "@/lib/dal/auth";
import { abrirEnlace } from "@/lib/use-cases/acceso";

const tipoSchema = z.enum(TIPOS_DE_ENLACE);

/**
 * GET /acceso/confirmar (D-020, D-034): where the links in Supabase's emails
 * land (account activation and password recovery). It opens the session and
 * redirects:
 * - recovery → /nueva-contrasena, to choose the new password;
 * - activation → the role's home, already logged in.
 * Accepts both link formats: `?code=` (Supabase's default) and
 * `?token_hash=&type=` (if the email templates are changed to it). An expired
 * or broken link sends to the login (or to /nueva-contrasena, which explains
 * that the link expired when the person tries to save).
 */
export async function GET(request: NextRequest) {
  const parametros = request.nextUrl.searchParams;
  const code = parametros.get("code");
  const tokenHash = parametros.get("token_hash");
  const tipo = tipoSchema.safeParse(parametros.get("type"));
  const esRecuperacion = parametros.get("tipo") === "recuperacion" || (tipo.success && tipo.data === "recovery");
  const siFalla = esRecuperacion ? "/nueva-contrasena" : "/postulante/ingresar";

  const enlace = code ? { code } : tokenHash && tipo.success ? { tokenHash, tipo: tipo.data } : null;
  if (!enlace) redirect(siFalla);

  const resultado = await abrirEnlace(enlace, esRecuperacion);
  redirect(resultado.ok ? resultado.datos.destino : siFalla);
}
