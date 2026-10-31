import type { Metadata } from "next";

import { EnlacesAcceso } from "@/components/auth/EnlacesAcceso";
import { FormularioNuevaContrasena } from "@/components/auth/FormularioNuevaContrasena";
import { TarjetaAcceso } from "@/components/auth/TarjetaAcceso";

export const metadata: Metadata = { title: "Nueva contraseña" };

/** P02/P08: new password, reached from the recovery email link or "Mi cuenta" (shared by all roles). */
export default function NuevaContrasenaPage() {
  return (
    <TarjetaAcceso
      titulo="Creá una contraseña nueva"
      descripcion="Vas a usarla para ingresar de ahora en adelante."
      pie={<EnlacesAcceso enlaces={[{ href: "/", texto: "Volver al inicio" }]} />}
    >
      <FormularioNuevaContrasena />
    </TarjetaAcceso>
  );
}
