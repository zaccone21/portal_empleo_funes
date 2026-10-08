"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { FieldGroup } from "@/components/ui/field";
import { useIngreso } from "@/hooks/useIngreso";
import { esRutaInterna } from "@/lib/rutas";
import { ingresoSchema, type DatosIngreso } from "@/lib/validation/auth";

import { BotonEnviar } from "./BotonEnviar";
import { CampoContrasena } from "./CampoContrasena";
import { CampoEmail } from "./CampoEmail";
import { ErrorDelServidor } from "./ErrorDelServidor";

type Errores = Partial<Record<keyof DatosIngreso, string[]>>;

type Props = {
  /**
   * Where the person was before being asked to log in (?volver= in the URL),
   * for example the offer they wanted to apply to. Only used if it is a path
   * of this site (esRutaInterna); otherwise the server's `destino` wins.
   */
  volver?: string;
};

/**
 * Login form, the same for the three portals (P02, P08, P13). The page
 * decides the title and the links; this component handles the whole submit.
 *
 * On submit:
 * 1. Reads the values with FormData (uncontrolled inputs).
 * 2. Validates them with ingresoSchema, the same schema the server uses. If
 *    something is wrong, shows each message under its field and stops.
 * 3. Sends them with useIngreso. The button is disabled while waiting.
 * 4. If the server accepts them, goes back to `volver` when there is one (the
 *    screen that asked to log in), or else to `destino`, the role's home. It
 *    uses router.replace, so the back button does not return to the login.
 *    If not, the server's message is shown above the button.
 *
 * The portal does not limit who can log in: the server decides `destino` from
 * the role stored in `profiles`, so a company that logs in from the applicant
 * screen still lands on /empresa. Permission checks happen on the server
 * (AGENTS §7), not here.
 *
 * `noValidate` turns off the browser's own bubbles, which appear in the
 * phone's language and style, so only our messages are shown.
 */
export function FormularioIngreso({ volver }: Props) {
  const router = useRouter();
  const { ingresar, loading, error } = useIngreso();
  const [errores, setErrores] = useState<Errores>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const resultado = ingresoSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!resultado.success) {
      setErrores(z.flattenError(resultado.error).fieldErrors);
      return;
    }

    setErrores({});
    const destino = await ingresar(resultado.data);
    if (destino) {
      router.replace(esRutaInterna(volver) ? volver : destino);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <FieldGroup className="gap-5">
        <CampoEmail error={errores.email?.[0]} obligatorio />
        <CampoContrasena
          id="password"
          name="password"
          label="Contraseña"
          autoComplete="current-password"
          error={errores.password?.[0]}
          obligatorio
        />
      </FieldGroup>
      <ErrorDelServidor error={error} />
      <BotonEnviar loading={loading} texto="Ingresar" textoCargando="Ingresando…" />
    </form>
  );
}
