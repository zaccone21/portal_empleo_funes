import { getCurrentUser } from "@/lib/dal/auth";
import { datosInvalidos, esIdValido, leerCuerpo, noEncontrado, responder, sinSesion } from "@/lib/respuestas-api";
import { decidirCandidato } from "@/lib/use-cases/empresa";
import { decisionCandidatoSchema } from "@/lib/validation/candidatos";

/**
 * POST /api/empresa/candidatos/[id]/decision (P17; RF1.6.4, D-044): the
 * company answers "Contrata" or "No contrata" (with the reason) for an
 * applicant referred to its offer. 200 `{ candidato }`; 400 without the reason;
 * 404 if it is not its referred applicant; 409 if it already answered.
 */
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const usuario = await getCurrentUser();
  if (!usuario) return sinSesion();

  const { id } = await ctx.params;
  if (!esIdValido(id)) return noEncontrado("No encontramos a esa persona entre tus candidatos.");

  const datos = decisionCandidatoSchema.safeParse(await leerCuerpo(request));
  if (!datos.success) return datosInvalidos(datos.error);

  return responder(await decidirCandidato(usuario, id, datos.data));
}
