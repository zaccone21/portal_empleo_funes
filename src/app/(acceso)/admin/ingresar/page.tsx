import type { Metadata } from "next";

import { FormularioIngreso } from "@/components/auth/FormularioIngreso";
import { TarjetaAcceso } from "@/components/auth/TarjetaAcceso";

export const metadata: Metadata = { title: "Ingreso de la Oficina de Empleo" };

/**
 * P13: Office staff login. No links at the bottom: admin accounts are created
 * by hand (RF1.1.4) and there is no self-service recovery (D-020).
 */
export default function AdminIngresarPage() {
  return (
    <TarjetaAcceso
      titulo="Ingreso de la Oficina de Empleo"
      descripcion="Solo para el personal de la Oficina."
    >
      <FormularioIngreso />
    </TarjetaAcceso>
  );
}
