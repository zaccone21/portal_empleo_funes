import type { Metadata } from "next";

import { VistaCandidatosEmpresa } from "@/components/empresa/VistaCandidatosEmpresa";
import { Seccion } from "@/components/marca/Seccion";

export const metadata: Metadata = { title: "Candidatos propuestos · Portal Empresa" };

export default function EmpresaCandidatosPage() {
  return (
    <Seccion
      titulo="Candidatos propuestos por la Oficina"
      bajada="Candidatos propuestos por la Oficina de Empleo para tus búsquedas activas."
    >
      <VistaCandidatosEmpresa />
    </Seccion>
  );
}
