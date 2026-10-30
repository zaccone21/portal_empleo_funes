import type { Metadata } from "next";

import { CalendarioPreentrevistas } from "@/components/admin/calendario-preentrevistas";
import { operadorActual } from "@/lib/admin/datos";
import { verPostulacionesAdmin } from "@/lib/use-cases/oficina";

export const metadata: Metadata = { title: "Pre-entrevistas · Oficina de Empleo" };

export default async function AdminPreentrevistasPage() {
  const usuario = await operadorActual();
  const resPostulaciones = await verPostulacionesAdmin(usuario);
  const todas = resPostulaciones.ok ? resPostulaciones.datos : [];

  const conPreentrevista = todas.filter((p) => p.preentrevista !== null);

  return <CalendarioPreentrevistas postulacionesConPreentrevista={conPreentrevista} />;
}
