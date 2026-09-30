import type { Metadata } from "next";

import { EnlacesAcceso } from "@/components/auth/EnlacesAcceso";
import { FormularioRegistro } from "@/components/auth/FormularioRegistro";
import { TarjetaAcceso } from "@/components/auth/TarjetaAcceso";

export const metadata: Metadata = { title: "Crear cuenta" };

/**
 * P02: applicant registration. ?volver= brings the person back to the screen that sent them here
 * (for example the offer they wanted to apply to), also through the login link.
 */
export default async function PostulanteRegistrarsePage({ searchParams }: PageProps<"/postulante/registrarse">) {
  const { volver } = await searchParams;
  const destino = typeof volver === "string" ? volver : undefined;

  return (
    <TarjetaAcceso
      titulo="Creá tu cuenta"
      descripcion="Con tu cuenta vas a poder postularte a ofertas de trabajo en Funes."
      pie={
        <EnlacesAcceso
          enlaces={[{ href: destino ? `/postulante/ingresar?volver=${encodeURIComponent(destino)}` : "/postulante/ingresar", texto: "¿Ya tenés cuenta? Ingresá" }]}
        />
      }
    >
      <FormularioRegistro rol="postulante" volver={destino} />
    </TarjetaAcceso>
  );
}
