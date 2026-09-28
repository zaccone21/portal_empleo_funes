import type { Metadata } from "next";

import { EnlacesAcceso } from "@/components/auth/EnlacesAcceso";
import { FormularioIngreso } from "@/components/auth/FormularioIngreso";
import { TarjetaAcceso } from "@/components/auth/TarjetaAcceso";

export const metadata: Metadata = { title: "Ingresar como empresa" };

/** P08: company login. */
export default function EmpresaIngresarPage() {
  return (
    <TarjetaAcceso
      titulo="Ingresá como empresa"
      descripcion="Para publicar ofertas de trabajo y ver cómo avanzan."
      pie={
        <EnlacesAcceso
          enlaces={[
            { href: "/empresa/registrarse", texto: "¿Tu empresa no tiene cuenta? Registrala" },
            { href: "/empresa/recuperar-contrasena", texto: "Olvidé mi contraseña" },
          ]}
        />
      }
    >
      <FormularioIngreso />
    </TarjetaAcceso>
  );
}
