import type { Metadata } from "next";

import { EnlacesAcceso } from "@/components/auth/EnlacesAcceso";
import { FormularioRecuperarContrasena } from "@/components/auth/FormularioRecuperarContrasena";
import { TarjetaAcceso } from "@/components/auth/TarjetaAcceso";

export const metadata: Metadata = { title: "Recuperar contraseña" };

/** P02: applicant password recovery. */
export default function PostulanteRecuperarContrasenaPage() {
  return (
    <TarjetaAcceso
      titulo="Recuperá tu contraseña"
      descripcion="Escribí tu email y te mandamos un enlace para crear una contraseña nueva."
      pie={
        <EnlacesAcceso enlaces={[{ href: "/postulante/ingresar", texto: "Volver a ingresar" }]} />
      }
    >
      <FormularioRecuperarContrasena />
    </TarjetaAcceso>
  );
}
