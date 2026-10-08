import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RegistroEmpresas } from "@/features/empresas/ui/RegistroEmpresas";
import { getCurrentUser } from "@/lib/dal/auth";
import { buscarEmpresas } from "@/lib/use-cases/oficina";

export const metadata: Metadata = { title: "Registro de empresas" };

export default async function AdminEmpresasPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams = await props.searchParams;
  const usuario = await getCurrentUser();
  if (!usuario) return null;

  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  
  const resultado = await buscarEmpresas(usuario, { q });
  if (!resultado.ok) return notFound();

  return <RegistroEmpresas empresas={resultado.datos} />;
}
