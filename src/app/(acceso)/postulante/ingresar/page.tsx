import type { Metadata } from "next";

import { EnlacesAcceso } from "@/components/auth/EnlacesAcceso";
import { FormularioIngreso } from "@/components/auth/FormularioIngreso";
import { TarjetaAcceso } from "@/components/auth/TarjetaAcceso";

export const metadata: Metadata = { title: "Ingresar" };

/**
 * P02: applicant login (accepts Email or DNI). ?volver= brings the person back
 * to the screen that asked them to log in (for example the offer they wanted to
 * apply to). ?error=enlace_vencido informs when an activation link from email expired.
 */
export default async function PostulanteIngresarPage({ searchParams }: PageProps<"/postulante/ingresar">) {
  const { volver, error } = await searchParams;

  return (
    <TarjetaAcceso
      titulo="Ingresá a tu cuenta"
      descripcion="Ingresá con tu email o tu DNI para ver ofertas de trabajo y postularte."
      pie={
        <EnlacesAcceso
          enlaces={[
            { href: "/postulante/registrarse", texto: "¿No tenés cuenta? Registrate" },
            { href: "/postulante/recuperar-contrasena", texto: "Olvidé mi contraseña" },
            { href: "/empresa/ingresar", texto: "¿Sos una empresa? Ingresá acá" },
          ]}
        />
      }
    >
      <FormularioIngreso
        modoAcceso="postulante"
        volver={typeof volver === "string" ? volver : undefined}
        enlaceVencido={error === "enlace_vencido"}
      />
    </TarjetaAcceso>
  );
}
