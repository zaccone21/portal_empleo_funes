import type { Metadata } from "next";

import { EnlacesAcceso } from "@/components/auth/EnlacesAcceso";
import { FormularioIngreso } from "@/components/auth/FormularioIngreso";
import { TarjetaAcceso } from "@/components/auth/TarjetaAcceso";

export const metadata: Metadata = { title: "Ingresar" };

/**
 * P02: applicant login. ?volver= brings the person back to the screen that
 * asked them to log in (for example the offer they wanted to apply to). The
 * links below also cover people who landed here by mistake: the offers can be
 * seen without an account, and companies have their own login.
 */
export default async function PostulanteIngresarPage({ searchParams }: PageProps<"/postulante/ingresar">) {
  const { volver } = await searchParams;

  return (
    <TarjetaAcceso
      titulo="Ingresá a tu cuenta"
      descripcion="Para ver ofertas de trabajo y postularte."
      pie={
        <EnlacesAcceso
          enlaces={[
            { href: "/postulante/registrarse", texto: "¿No tenés cuenta? Registrate" },
            { href: "/postulante/recuperar-contrasena", texto: "Olvidé mi contraseña" },
            { href: "/ofertas", texto: "Ver las ofertas sin ingresar" },
            { href: "/empresa/ingresar", texto: "¿Sos una empresa? Ingresá acá" },
          ]}
        />
      }
    >
      <FormularioIngreso volver={typeof volver === "string" ? volver : undefined} />
    </TarjetaAcceso>
  );
}
