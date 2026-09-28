import type { Metadata } from "next";

import { EnlacesAcceso } from "@/components/auth/EnlacesAcceso";
import { FormularioIngreso } from "@/components/auth/FormularioIngreso";
import { TarjetaAcceso } from "@/components/auth/TarjetaAcceso";

export const metadata: Metadata = { title: "Ingresar" };

/** P02: applicant login. */
export default function PostulanteIngresarPage() {
  return (
    <TarjetaAcceso
      titulo="Ingresá a tu cuenta"
      descripcion="Para ver ofertas de trabajo y postularte."
      pie={
        <EnlacesAcceso
          enlaces={[
            { href: "/postulante/registrarse", texto: "¿No tenés cuenta? Registrate" },
            { href: "/postulante/recuperar-contrasena", texto: "Olvidé mi contraseña" },
          ]}
        />
      }
    >
      <FormularioIngreso />
    </TarjetaAcceso>
  );
}
