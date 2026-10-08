import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/dal/auth";
import { responder } from "@/lib/respuestas-api";
import { buscarPostulantes } from "@/lib/use-cases/oficina";

export async function GET(request: Request) {
  const usuario = await getCurrentUser();
  if (!usuario) return responder({ ok: false, falla: "unauthenticated", mensaje: "No autorizado" });

  const url = new URL(request.url);
  const q = url.searchParams.get("q") || undefined;
  const rubros = url.searchParams.getAll("rubro");

  const resultado = await buscarPostulantes(usuario, { q, rubros: rubros.length > 0 ? rubros : undefined });
  if (!resultado.ok) return responder(resultado);

  return NextResponse.json(resultado.datos);
}
