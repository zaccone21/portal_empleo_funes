import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/dal/auth";
import { esIdValido, noEncontrado, responder, sinSesion } from "@/lib/respuestas-api";
import { abrirCv } from "@/lib/use-cases/oficina";

/**
 * GET /api/admin/postulaciones/[id]/cv (RF1.5.5, RNF1, D-030): redirects to a
 * signed link to the applicant's CV in the private bucket, valid for a minute.
 * The "Ver CV" link opens it in a new tab.
 */
export async function GET(_request: Request, ctx: RouteContext<"/api/admin/postulaciones/[id]/cv">) {
  const usuario = await getCurrentUser();
  if (!usuario) return sinSesion();

  const { id } = await ctx.params;
  if (!esIdValido(id)) return noEncontrado("No encontramos esa postulación.");

  const resultado = await abrirCv(usuario, id);
  if (resultado.ok) redirect(resultado.datos.url);
  return responder(resultado);
}
