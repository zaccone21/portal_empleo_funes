import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/dal/auth";
import { esIdValido, noEncontrado, responder, sinSesion } from "@/lib/respuestas-api";
import { abrirCvCandidato } from "@/lib/use-cases/empresa";

/**
 * GET /api/empresa/candidatos/[id]/cv (P17; RNF1, D-044): redirects to a
 * short-lived signed link to the CV of an applicant referred to the company's
 * offer. The id is the application's, so the company never handles applicant ids.
 */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const usuario = await getCurrentUser();
  if (!usuario) return sinSesion();

  const { id } = await ctx.params;
  if (!esIdValido(id)) return noEncontrado("No encontramos a esa persona entre tus candidatos.");

  const resultado = await abrirCvCandidato(usuario, id);
  if (resultado.ok) redirect(resultado.datos.url);
  return responder(resultado);
}
