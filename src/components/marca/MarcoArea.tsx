import type { ReactNode } from "react";

import { ProveedorSesion } from "@/components/sesion/ProveedorSesion";
import type { Role } from "@/lib/validation/role";

import { BarraInferior } from "./BarraInferior";
import { EncabezadoPortal } from "./EncabezadoPortal";

/**
 * Shell of every inner area of the portal (D-028): the session (read once for
 * the whole area), the top bar and, on phones, the bottom bar with the menu.
 * Used by the layouts of the applicant, company and Office areas, and by the
 * home page (which belongs to the applicant area: most visitors look for work).
 *
 * `area` is the role the area belongs to; it decides what to offer to someone
 * who is not logged in. --alto-barra-inferior is the phone bottom bar's
 * height (0 from `lg` up); the content and the pinned footers use it to stay
 * above the bar.
 */
export function MarcoArea({ area, children }: { area: Role; children: ReactNode }) {
  return (
    <ProveedorSesion>
      <div className="flex min-h-dvh flex-1 flex-col bg-brand-deep [--alto-barra-inferior:calc(4.25rem+env(safe-area-inset-bottom))] lg:[--alto-barra-inferior:0px]">
        <EncabezadoPortal area={area} />
        {children}
        <BarraInferior area={area} />
      </div>
    </ProveedorSesion>
  );
}
