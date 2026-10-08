import type { Metadata } from "next";

import { EnlacesAcceso } from "@/components/auth/EnlacesAcceso";
import { FormularioIngreso } from "@/components/auth/FormularioIngreso";
import { TarjetaAcceso } from "@/components/auth/TarjetaAcceso";

export const metadata: Metadata = { title: "Ingresar como empresa" };

/**
 * P08: company login. ?volver= brings the person back to the screen that
 * asked them to log in.
 */
export default async function EmpresaIngresarPage({ searchParams }: PageProps<"/empresa/ingresar">) {
  const { volver } = await searchParams;

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
      <FormularioIngreso volver={typeof volver === "string" ? volver : undefined} />
    </TarjetaAcceso>
  );
}
