import type { Metadata } from "next";

import { PerfilEmpresa } from "@/components/empresa/PerfilEmpresa";
import { Seccion } from "@/components/marca/Seccion";

export const metadata: Metadata = { title: "Datos de la empresa" };

/** P10: the company's data (RF1.3.2). */
export default function EmpresaPerfilPage() {
  return (
    <Seccion
      titulo="Datos de la empresa"
      bajada="La Oficina de Empleo los usa para comunicarse con ustedes."
    >
      <PerfilEmpresa />
    </Seccion>
  );
}
