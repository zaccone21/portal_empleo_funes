import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/dal/auth";
import { responder, sinSesion } from "@/lib/respuestas-api";
import { abrirMiCv } from "@/lib/use-cases/postulante";

/**
 * GET /api/cv/archivo (RF1.2.3, RNF1): redirects the applicant to a short-lived
 * signed URL to view or download their own CV PDF stored in the private Supabase bucket.
 */
export async function GET() {
  const usuario = await getCurrentUser();
  if (!usuario) return sinSesion();

  const resultado = await abrirMiCv(usuario);
  if (resultado.ok) redirect(resultado.datos.url);
  return responder(resultado);
}
