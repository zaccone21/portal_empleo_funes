import type { Metadata } from "next";

import { EnlacesAcceso } from "@/components/auth/EnlacesAcceso";
import { FormularioRegistro } from "@/components/auth/FormularioRegistro";
import { TarjetaAcceso } from "@/components/auth/TarjetaAcceso";

export const metadata: Metadata = { title: "Registrar empresa" };

/**
 * P08: company registration. ?volver= brings the person back to the screen that sent them here
 * (for example the offer they wanted to apply to), also through the login link.
 */
export default async function EmpresaRegistrarsePage({ searchParams }: PageProps<"/empresa/registrarse">) {
  const { volver } = await searchParams;
  const destino = typeof volver === "string" ? volver : undefined;

  return (
    <TarjetaAcceso
      titulo="Registrá tu empresa"
      descripcion="Con la cuenta vas a poder publicar ofertas de trabajo."
      pie={
        <EnlacesAcceso
          enlaces={[{ href: destino ? `/empresa/ingresar?volver=${encodeURIComponent(destino)}` : "/empresa/ingresar", texto: "¿Tu empresa ya tiene cuenta? Ingresá" }]}
        />
      }
    >
      <FormularioRegistro rol="empresa" volver={destino} />
    </TarjetaAcceso>
  );
}
