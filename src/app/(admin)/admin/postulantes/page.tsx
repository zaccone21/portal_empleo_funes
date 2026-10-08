import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RegistroPostulantes } from "@/features/postulantes/ui/RegistroPostulantes";
import { getCurrentUser } from "@/lib/dal/auth";
import { buscarPostulantes } from "@/lib/use-cases/oficina";

export const metadata: Metadata = { title: "Registro de postulantes" };

export default async function AdminPostulantesPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams = await props.searchParams;
  const usuario = await getCurrentUser();
  if (!usuario) return null;

  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  
  // We fetch using the server-side use case
  const resultado = await buscarPostulantes(usuario, { q });
  if (!resultado.ok) return notFound();

  return <RegistroPostulantes postulantes={resultado.datos} />;
}
