import type { Metadata } from "next";

import { ResumenEmpresa } from "@/components/empresa/ResumenEmpresa";
import { Seccion } from "@/components/marca/Seccion";

export const metadata: Metadata = { title: "Inicio de la empresa" };

/** P09: the company's home, a summary of its activity (RF1.3.1). */
export default function EmpresaInicioPage() {
  return (
    <Seccion titulo="Tu empresa en el portal" bajada="Publicá ofertas de trabajo y seguí cómo avanzan.">
      <ResumenEmpresa />
    </Seccion>
  );
}
