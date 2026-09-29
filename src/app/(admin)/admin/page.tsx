import type { Metadata } from "next";

import { Seccion } from "@/components/marca/Seccion";
import { ResumenOficina } from "@/components/oficina/ResumenOficina";

export const metadata: Metadata = { title: "Panel de la Oficina" };

/** P14: the Office's panel, what needs attention today (RF1.5.1). */
export default function AdminPanelPage() {
  return (
    <Seccion titulo="Panel de la Oficina" bajada="Lo que necesita atención hoy. Tocá cada número para ir a resolverlo.">
      <ResumenOficina />
    </Seccion>
  );
}
