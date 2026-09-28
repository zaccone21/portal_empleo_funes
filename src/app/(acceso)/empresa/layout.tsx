import type { ReactNode } from "react";

import { PanelAcceso } from "@/components/auth/PanelAcceso";

/** Slogan shared by the company's access screens (P08). */
export default function EmpresaAccesoLayout({ children }: { children: ReactNode }) {
  return (
    <PanelAcceso
      lema="Sumá gente de Funes a tu equipo."
      bajada="Publicá tu búsqueda y la Oficina de Empleo te acerca candidatos de la ciudad."
    >
      {children}
    </PanelAcceso>
  );
}
