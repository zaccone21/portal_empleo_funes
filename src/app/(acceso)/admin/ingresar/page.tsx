import type { Metadata } from "next";

import { FormularioIngreso } from "@/components/auth/FormularioIngreso";
import { TarjetaAcceso } from "@/components/auth/TarjetaAcceso";

export const metadata: Metadata = { title: "Ingreso de la Oficina de Empleo" };

/**
 * P13: Office staff login. No links at the bottom: admin accounts are created
 * by hand (RF1.1.4) and there is no self-service recovery (D-020).
 * ?volver= brings the person back to the screen that asked them to log in.
 */
export default async function AdminIngresarPage({ searchParams }: PageProps<"/admin/ingresar">) {
  const { volver } = await searchParams;

  return (
    <TarjetaAcceso
      titulo="Ingreso de la Oficina de Empleo"
      descripcion="Solo para el personal de la Oficina."
    >
      <FormularioIngreso volver={typeof volver === "string" ? volver : undefined} />
    </TarjetaAcceso>
  );
}
