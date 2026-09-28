import type { ReactNode } from "react";

import { PanelAcceso } from "@/components/auth/PanelAcceso";

/** Slogan of the new password screen, shared by applicants and companies. */
export default function NuevaContrasenaLayout({ children }: { children: ReactNode }) {
  return (
    <PanelAcceso
      lema="Volvé a entrar a tu cuenta."
      bajada="Elegí una contraseña nueva y seguí donde estabas."
    >
      {children}
    </PanelAcceso>
  );
}
