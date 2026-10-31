import type { Metadata } from "next";

import { GestionCursos } from "@/components/admin/gestion-cursos";
import { operadorActual } from "@/lib/admin/datos";
import { verCursosAdmin, verPostulantesConTresRechazos } from "@/lib/use-cases/oficina";

export const metadata: Metadata = { title: "Cursos y Capacitaciones · Oficina de Empleo" };

export default async function AdminCursosPage() {
  const usuario = await operadorActual();

  const [resCursos, resRechazos] = await Promise.all([
    verCursosAdmin(usuario),
    verPostulantesConTresRechazos(usuario),
  ]);

  return (
    <GestionCursos
      cursos={resCursos.ok ? resCursos.datos : []}
      postulantesConRechazos={resRechazos.ok ? resRechazos.datos : []}
    />
  );
}
