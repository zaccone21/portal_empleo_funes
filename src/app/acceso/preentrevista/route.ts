import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { responderPreentrevistaPorToken } from "@/lib/use-cases/postulante";

const tokenSchema = z.string().uuid();

/**
 * GET /acceso/preentrevista: handles the candidate's click from the pre-interview
 * email (`?token=<uuid>&accion=confirmar|cancelar`) through its use case (AGENTS §6).
 * - `confirmar`: transitions the pre-interview from `pendiente_confirmacion` to `agendada`.
 * - `cancelar`: notifies the Office that the candidate cannot attend that slot (`no_agendada`).
 */
export async function GET(request: NextRequest) {
  const parametros = request.nextUrl.searchParams;
  const tokenRaw = parametros.get("token");
  const accion = parametros.get("accion") === "cancelar" ? "cancelar" : "confirmar";

  const parsedToken = tokenSchema.safeParse(tokenRaw);
  if (!parsedToken.success) {
    redirect("/preentrevista/confirmada?resultado=invalido");
  }

  const confirmar = accion === "confirmar";
  const respuesta = await responderPreentrevistaPorToken(parsedToken.data, confirmar);

  if (!respuesta.ok) {
    redirect("/preentrevista/confirmada?resultado=invalido");
  }

  redirect(`/preentrevista/confirmada?resultado=${respuesta.datos.resultado}`);
}
