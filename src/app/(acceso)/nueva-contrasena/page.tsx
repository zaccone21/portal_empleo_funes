import type { Metadata } from "next";

import { FormularioNuevaContrasena } from "@/components/auth/FormularioNuevaContrasena";
import { TarjetaAcceso } from "@/components/auth/TarjetaAcceso";

export const metadata: Metadata = { title: "Nueva contraseña" };

/** P02/P08: new password, reached from the recovery email link (shared by applicants and companies). */
export default function NuevaContrasenaPage() {
  return (
    <TarjetaAcceso
      titulo="Creá una contraseña nueva"
      descripcion="Vas a usarla para ingresar de ahora en adelante."
    >
      <FormularioNuevaContrasena />
    </TarjetaAcceso>
  );
}
