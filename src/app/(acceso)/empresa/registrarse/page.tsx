import type { Metadata } from "next";

import { EnlacesAcceso } from "@/components/auth/EnlacesAcceso";
import { FormularioRegistro } from "@/components/auth/FormularioRegistro";
import { TarjetaAcceso } from "@/components/auth/TarjetaAcceso";

export const metadata: Metadata = { title: "Registrar empresa" };

/** P08: company registration. */
export default function EmpresaRegistrarsePage() {
  return (
    <TarjetaAcceso
      titulo="Registrá tu empresa"
      descripcion="Con la cuenta vas a poder publicar ofertas de trabajo."
      pie={
        <EnlacesAcceso
          enlaces={[{ href: "/empresa/ingresar", texto: "¿Tu empresa ya tiene cuenta? Ingresá" }]}
        />
      }
    >
      <FormularioRegistro rol="company" />
    </TarjetaAcceso>
  );
}
