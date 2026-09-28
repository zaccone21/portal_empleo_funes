import type { ReactNode } from "react";

import { PanelAcceso } from "@/components/auth/PanelAcceso";

/** Slogan of the Office staff login (P13). */
export default function AdminAccesoLayout({ children }: { children: ReactNode }) {
  return (
    <PanelAcceso
      lema="El panel de la Oficina de Empleo."
      bajada="Revisá ofertas, evaluá postulaciones y buscá candidatos en el padrón."
    >
      {children}
    </PanelAcceso>
  );
}
