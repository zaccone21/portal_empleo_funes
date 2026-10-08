import type { Metadata } from "next";

import { RegistroOfertas } from "@/features/ofertas/ui/RegistroOfertas";
import { getCurrentUser } from "@/lib/dal/auth";
import { verOfertas } from "@/lib/use-cases/oficina";

export const metadata: Metadata = { title: "Gestión de ofertas" };

/**
 * P15: the Office's offer management (RF1.5.2–RF1.5.6).
 */
export default async function AdminOfertasPage() {
  const usuario = await getCurrentUser();
  if (!usuario) return null; // El layout ya redirige

  const resultado = await verOfertas(usuario);
  if (!resultado.ok) return null;

  return <RegistroOfertas ofertas={resultado.datos} />;
}
