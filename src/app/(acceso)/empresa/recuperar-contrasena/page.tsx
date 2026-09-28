import type { Metadata } from "next";

import { EnlacesAcceso } from "@/components/auth/EnlacesAcceso";
import { FormularioRecuperarContrasena } from "@/components/auth/FormularioRecuperarContrasena";
import { TarjetaAcceso } from "@/components/auth/TarjetaAcceso";

export const metadata: Metadata = { title: "Recuperar contraseña de empresa" };

/** P08: company password recovery. */
export default function EmpresaRecuperarContrasenaPage() {
  return (
    <TarjetaAcceso
      titulo="Recuperá tu contraseña"
      descripcion="Escribí el email de la empresa y te mandamos un enlace para crear una contraseña nueva."
      pie={<EnlacesAcceso enlaces={[{ href: "/empresa/ingresar", texto: "Volver a ingresar" }]} />}
    >
      <FormularioRecuperarContrasena />
    </TarjetaAcceso>
  );
}
