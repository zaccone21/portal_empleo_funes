import type { ReactNode } from "react";

import { PanelAcceso } from "@/components/auth/PanelAcceso";

/** Slogan shared by the applicant's access screens (P02). */
export default function PostulanteAccesoLayout({ children }: { children: ReactNode }) {
  return (
    <PanelAcceso
      lema="Tu próximo trabajo está en Funes."
      bajada="Mirá las ofertas de comercios y empresas de la ciudad y postulate desde el celular."
    >
      {children}
    </PanelAcceso>
  );
}
