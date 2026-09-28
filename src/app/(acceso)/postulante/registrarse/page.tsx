import type { Metadata } from "next";

import { EnlacesAcceso } from "@/components/auth/EnlacesAcceso";
import { FormularioRegistro } from "@/components/auth/FormularioRegistro";
import { TarjetaAcceso } from "@/components/auth/TarjetaAcceso";

export const metadata: Metadata = { title: "Crear cuenta" };

/** P02: applicant registration. */
export default function PostulanteRegistrarsePage() {
  return (
    <TarjetaAcceso
      titulo="Creá tu cuenta"
      descripcion="Con tu cuenta vas a poder postularte a ofertas de trabajo en Funes."
      pie={
        <EnlacesAcceso
          enlaces={[{ href: "/postulante/ingresar", texto: "¿Ya tenés cuenta? Ingresá" }]}
        />
      }
    >
      <FormularioRegistro rol="applicant" />
    </TarjetaAcceso>
  );
}
