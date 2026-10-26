import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/dal/auth";
import { esIdValido, noEncontrado, responder, sinSesion } from "@/lib/respuestas-api";
import { abrirCvPostulante } from "@/lib/use-cases/oficina";

/**
 * GET /api/admin/postulantes/[id]/cv (RNF1, D-042): redirects to a signed link
 * to the applicant's CV in the private bucket, optionally setting download headers.
 */
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const usuario = await getCurrentUser();
  if (!usuario) return sinSesion();

  const { id } = await ctx.params;
  if (!esIdValido(id)) return noEncontrado("No encontramos a ese postulante.");

  const url = new URL(request.url);
  const descargar = url.searchParams.get("descargar") === "1";

  const resultado = await abrirCvPostulante(usuario, id, descargar);
  if (resultado.ok) redirect(resultado.datos.url);
  return responder(resultado);
}
